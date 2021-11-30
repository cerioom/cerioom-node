// https://thecodebarbarian.com/managing-connections-with-the-mongodb-node-driver.html
import { Application, DI, Env, Service } from '@cerioom/core'
import { Db, MongoClient, MongoClientOptions, ReadPreference, } from 'mongodb'
import { ConnectionIdentifier } from './connection.identifier'


const defaultOptions = <MongoClientOptions> {
    // dbCreateOptions,
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

    // highAvailabilityOptions,
    ha: true,
    haInterval: 10_000,
    domainsEnabled: false,

    // serverOptions,
    poolSize: 100,

    // socketOptions,
    noDelay: true,
    keepAlive: true,
    keepAliveInitialDelay: 30_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 60_000,

    // unifiedTopologyOptions,
    useUnifiedTopology: true,
    maxPoolSize: 1_000,
    minPoolSize: 5,

    useNewUrlParser: true,
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
            const mongoClient: MongoClient = connections.get(connId)
            if (mongoClient.isConnected()) {
                return mongoClient
            }
        }

        const [url, options] = await this.getConnectionParams()
        const mongoClient: MongoClient = await this.clientClass.connect(url, options)
        if (!connections.has(connId)) {
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
