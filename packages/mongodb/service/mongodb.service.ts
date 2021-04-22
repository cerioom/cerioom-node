// https://thecodebarbarian.com/managing-connections-with-the-mongodb-node-driver.html
import { Application, DI, Env, Service } from '@cerioom/core'
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

const connectionsParams = new Map<string, [string, MongoClientOptions]>()
const dbs = new Set()


export class MongodbService extends Service {
    protected connection: MongoClient


    constructor(
        protected clientClass: any = MongoClient,
    ) {
        super()
        process.on('exit', this.onExit)
    }

    public async getDb(name?: string): Promise<Db> {
        const dbName = [this.context.tenant?.id ?? '', name ?? DI.get(Application).name].filter(Boolean).join('-')
        this.log.debug({action: 'getDb', dbName: dbName})

        const mongoClient = await this.getConnection()
        const db = mongoClient.db(dbName, {returnNonCachedInstance: false})

        // if (this.profilingLevel) {
        //     this.logger.debug({dbName, profilingLevel: this.profilingLevel})
        //     await db.setProfilingLevel(this.profilingLevel)
        // }

        if (!dbs.has(dbName)) {
            db.on('error', this.onError)
            db.on('close', this.onClose)
            db.on('reconnect', this.onReconnect)
            db.on('fullsetup', this.onFullSetup)

            dbs.add(dbName)
        }

        return db
    }

    public async getConnection(): Promise<MongoClient> {
        return await this.clientClass.connect(...this.getConnectionParams())
    }

    protected onExit(): void {
        Object.keys(connectionsParams).map(async (connectionId) => {
            this.log.warn({connectionId: connectionId})
            await connectionsParams[connectionId].close()
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

    protected getConnectionParams(): [string, MongoClientOptions] {
        const hash = this.context.tenant.id || 'default'
        const connectionParams = connectionsParams.get(hash)
        if (connectionParams) {
            // return cached params
            return connectionParams
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
        this.log.trace({tenant: {id: this.context.tenant?.id}})

        const connectionUrl = `${schema}://${servers}`

        connectionsParams.set(hash, [connectionUrl, connectionOptions])

        return [connectionUrl, connectionOptions]
    }
}
