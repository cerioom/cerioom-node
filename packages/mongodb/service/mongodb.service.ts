// https://thecodebarbarian.com/managing-connections-with-the-mongodb-node-driver.html
import { Application, DI, Env, Service } from '@cerioom/core'
import {
    Db,
    DbCreateOptions,
    HighAvailabilityOptions,
    MongoClient,
    MongoClientOptions,
    ReadPreference,
    ServerOptions,
    SocketOptions,
    SSLOptions,
    UnifiedTopologyOptions
} from 'mongodb'
import { ConnectionIdentifier } from './connection.identifier'


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

const unifiedTopologyOptions: UnifiedTopologyOptions = {
    useUnifiedTopology: true,
    maxPoolSize: 1_000,
    minPoolSize: 5,
}

const sslOptions: SSLOptions = {
    poolSize: 100,
}

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
const connections = new Map<string, any>()


export class MongodbService extends Service {
    protected connection: MongoClient
    private readonly connectionIdentifier = DI.get(ConnectionIdentifier)


    constructor(
        protected clientClass: any = MongoClient,
    ) {
        super()
        process.on('exit', this.onExit.bind(this))
    }

    public async getDb(name?: string): Promise<Db> {
        const dbName = this.getDbName(name)
        this.log.debug({action: 'getDb', dbName: dbName})

        const mongoClient = await this.getConnection()
        const db = mongoClient.db(dbName, {returnNonCachedInstance: false})

        // if (this.profilingLevel) {
        //     this.logger.debug({dbName, profilingLevel: this.profilingLevel})
        //     await db.setProfilingLevel(this.profilingLevel)
        // }

        return db
    }

    public async getConnection(): Promise<MongoClient> {
        const connId = await this.connectionIdentifier.getIdentifier(this.context.tenant)

        if (connections.has(connId)) {
            const mongoClient: MongoClient = connections.get(this.context.tenant.id)
            if (mongoClient.isConnected()) {
                return mongoClient
            }
        }

        const [url, options] = await this.getConnectionParams()
        const mongoClient: MongoClient = await this.clientClass.connect(url, options)
        if (!connections.has(this.context.tenant.id)) {
            mongoClient.on('error', this.onError.bind(this))
            mongoClient.on('close', this.onClose.bind(this))
        }

        connections.set(connId, mongoClient)

        return mongoClient
    }

    protected getDbName(name?: string): string {
        const appName = name ?? DI.get(Application).name
        const tenantId = this.context.tenant?.id
        return [tenantId, appName].filter(Boolean).join('-')
    }

    protected async getConnectionParams(): Promise<[string, MongoClientOptions]> {
        const connId = await this.connectionIdentifier.getIdentifier(this.context.tenant)

        const connectionParams = connectionsParams.get(connId)
        if (connectionParams) {
            // return cached params
            return connectionParams
        }

        const envConfig = DI.get(Env).config

        const defaultOptions = <MongoClientOptions> {
            appname: process.env.npm_package_name ?? '',
            family: 4, // IP version
            ...dbCreateOptions,
            ...highAvailabilityOptions,
            ...serverOptions,
            ...socketOptions,
            ...sslOptions,
            ...unifiedTopologyOptions,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        const options = <MongoClientOptions & {schema?: string, servers?: string | string[]}> {
            ...defaultOptions,
            ...envConfig.get<object>('mongodb'),
            ...this.context.get<object>('mongodb')
        }
        const schema = options.schema || 'mongodb'
        let servers = options.servers || 'localhost'
        if (Array.isArray(servers)) {
            servers = servers.join(',')
        }
        delete options.schema
        delete options.servers

        const connectionUrl = `${schema}://${servers}`

        connectionsParams.set(connId, [connectionUrl, options])

        return [connectionUrl, options]
    }

    protected onExit(): void {
        Object.keys(connections).map(async (connectionId) => {
            this.log.warn({action: 'onExit', connectionId: connectionId})
            await connections[connectionId].close()
        })
    }

    protected onError(error) {
        this.log.error({action: 'onError', error: error, exit: 1})
        process.exit(1)
    }

    protected onClose(info) {
        this.log.warn({action: 'onClose', info: info})
    }

    protected onFullSetup() {
        this.log.warn({action: 'onFullSetup'})
    }
}
