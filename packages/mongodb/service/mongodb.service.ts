// https://thecodebarbarian.com/managing-connections-with-the-mongodb-node-driver.html
import { Application, ContextInterface, DI, Env, Security, Service } from '@cerioom/core'
import {
    Db,
    DbCreateOptions,
    HighAvailabilityOptions,
    MongoClient,
    MongoClientOptions,
    ReadPreference,
    ReplSetOptions,
    ServerOptions,
    SocketOptions,
    SSLOptions,
} from 'mongodb'
import { inspect } from 'util'


const dbCreateOptions = <DbCreateOptions> {
    forceServerObjectId: true,
    pkFactory: {
        // createPk: () => UUID.v1(),
    },
    readConcern: {
        level: 'majority',
    },
    /**
     * Before We will move to use secondaries node to read, We should:
     * 1. Change readConcern to majority
     * 2. Setup staleness timeouts, latency
     * 3. Fix migration engine to use PRIMARY only!
     * Now We will use PRIMARY_PREFERRED (because primary can be dead)
     */
    readPreference: ReadPreference.PRIMARY_PREFERRED,
}

const sslOptions: SSLOptions = {
    poolSize: 100,
}

const replSetOptions = <ReplSetOptions> {}

const socketOptions: SocketOptions = {
    noDelay: true,
    keepAlive: true,
    keepAliveInitialDelay: 30_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 60_000,
}

const serverOptions = <ServerOptions> {
    haInterval: 10_000,
}

const highAvailabilityOptions = <HighAvailabilityOptions> {
    ha: true,
    haInterval: 10_000,
    domainsEnabled: false,
}

const connections: {[hash: string]: MongoClient} = {}
let dbs: string[] = []


export class MongodbService extends Service {
    protected connection: MongoClient


    constructor(
        protected clientClass: any = MongoClient,
    ) {
        super()
        process.on('exit', this.onExit)
    }

    public async getDb(context?: ContextInterface /* todo remove */, name?: string): Promise<Db> {
        const _context = context || this.context
        const dbName = [_context.tenant?.id ?? '', name ?? DI.get(Application).name].filter(Boolean).join('-')
        this.log.debug({action: 'getDb', dbName: dbName})

        const db = (await this.getConnection(_context)).db(dbName, {returnNonCachedInstance: false})

        // if (this.profilingLevel) {
        //     this.logger.debug({dbName, profilingLevel: this.profilingLevel})
        //     await db.setProfilingLevel(this.profilingLevel)
        // }

        if (!dbs.includes(dbName)) {
            db.on('error', this.onError)
            db.on('close', this.onClose)
            db.on('reconnect', this.onReconnect)
            db.on('fullsetup', this.onFullSetup)

            dbs.push(dbName)
            dbs = [...new Set(dbs)]
        }

        return db
    }

    public async getConnection(context?: ContextInterface): Promise<MongoClient> {
        const _context = context || this.context
        if (connections[_context.tenant.id]) {
            if (connections[_context.tenant.id] instanceof Promise) {
                await connections[_context.tenant.id]
            }
            if (!connections[_context.tenant.id].isConnected()) {
                this.log.warn({}, 'Connection is not connected')
            }
            return connections[_context.tenant.id]
        }

        const envConfig = DI.get(Env).config

        const connectionOptions = <MongoClientOptions> {
            appname: process.env.npm_package_name ?? '',
            family: 4, // IP version
            ...dbCreateOptions,
            ...highAvailabilityOptions,
            ...serverOptions,
            ...socketOptions,
            ...sslOptions,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        const username = envConfig.get('mongodb.username')
        if (username) {
            const password = envConfig.get('mongodb.password')
            // @ts-expect-error
            connectionOptions.auth = {user: username, password: password}
        }

        const authSource = envConfig.get('mongodb.authSource')
        if (authSource) {
            // @ts-expect-error
            connectionOptions.authSource = authSource
        }

        const schema = envConfig.get('mongodb.schema') || 'mongodb'

        if (username || authSource) {
            connectionOptions.authMechanism = envConfig.get('mongodb.authMechanism') ?? 'SCRAM-SHA-1'
        }

        const replicaSet = envConfig.get('mongodb.replicaSet')
        if (replicaSet) {
            Object.assign(connectionOptions, replSetOptions, {replicaSet: replicaSet})
        }

        let servers = envConfig.get('mongodb.servers') || '127.0.0.1'
        if (Array.isArray(servers)) {
            servers = servers.join(',')
        }
        this.log.trace({tenant: {id: _context.tenant?.id}})

        const connectionUrl = `${schema}://${servers}`

        if (connections[_context.tenant.id]) {
            if (connections[_context.tenant.id] instanceof Promise) {
                await connections[_context.tenant.id]
            }
        } else {
            const logData = {
                action: 'getConnection',
                tenant: {id: _context.tenant.id},
                connectionUrl: connectionUrl,
                options: inspect(Security.maskFields(connectionOptions, ['auth.password'])),
            }
            this.log.info(logData)

            connections[_context.tenant.id] = this.clientClass.connect(connectionUrl, connectionOptions)

            try {
                connections[_context.tenant.id] = await connections[_context.tenant.id]
            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete connections[_context.tenant.id]
                this.log.warn({...logData, error: err})
                throw err
            }
        }

        return connections[_context.tenant.id]
    }

    protected onExit(): void {
        Object.keys(connections).map(async (connectionId) => {
            this.log.warn({connectionId: connectionId})
            await connections[connectionId].close()
        })
    }

    protected onError(error) {
        this.log.error({error: error, exit: 1})
        process.exit(1)
    }

    protected onClose(info) {
        this.log.warn({info: info})
    }

    protected onReconnect(info) {
        this.log.warn({info: info})
    }

    protected onFullSetup() {
        this.log.warn()
    }
}
