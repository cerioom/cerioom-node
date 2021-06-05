import {
    Application,
    ContextManager,
    DI,
    Env,
    RequestEnvelopeInterface,
    ResponseEnvelopeInterface,
    RuntimeError,
    Service,
} from '@cerioom/core'
import { EventBusTransportInterface } from '@cerioom/event-bus'
import { hostname } from 'os'
import { Client as NatsClient, connect as NATS, Msg, NatsConnectionOptions, NatsError, Payload, Subscription } from 'ts-nats'
import { RequestOptionsInterface } from './request-options.interface'
import { SubscribeOptionsInterface } from './subscribe-options.interface'
import Middie = require('middie/engine')


export class NatsTransport extends Service implements EventBusTransportInterface {
    public readonly kind = 'nats'

    protected readonly DEFAULT_REQUEST_TIMEOUT_MS
    protected readonly pool: Map<string, {nats: NatsClient}> = new Map()
    protected subscriptions: Map<string | symbol, WeakMap<Function, Subscription>> = new Map()
    protected middie: Middie
    private _listeners: Function[] = []

    protected env = DI.get(Env)
    protected app = DI.get(Application)
    protected contextManager = DI.get(ContextManager)


    constructor(opts: {middie: Middie}) {
        super()

        this.DEFAULT_REQUEST_TIMEOUT_MS = this.env.isDevMode ? 30_000 : 1_500

        process.on('exit', async () => {
            this.log.warn('onExit')
            await this.gracefulUnSubscribeAll()
        })

        this.middie = opts.middie
    }

    public async gracefulUnSubscribeAll(): Promise<void> {
        this.subscriptions.forEach((listeners, subject) => {
            let i = 0
            this._listeners.forEach(listener => {
                const subscription = listeners.get(listener)
                if (subscription) {
                    subscription.drain()
                    listeners.delete(listener)
                    i++
                }
            })
            this.log.debug({event: subject, i: i}, `unsubscribed ${i}`)
        })
        this.subscriptions.clear()
    }

    public async request(
        subject: string,
        payload: RequestEnvelopeInterface,
        opts: RequestOptionsInterface,
    ): Promise<ResponseEnvelopeInterface[]> {
        const conn = await this.getConnection()
        const headers = this.contextManager.makeHeaders(this.context)

        this.emit('pre:request', {subject: subject, payload: payload, headers: headers, opts: opts})
        const msg = await conn.nats.request(
            subject,
            opts.timeout ?? this.DEFAULT_REQUEST_TIMEOUT_MS,
            {...payload, headers: headers},
        )
        this.emit('post:request', {subject: subject, payload: payload, headers: headers, opts: opts, response: [msg.data]})

        return [msg.data] as ResponseEnvelopeInterface[] // todo
    }

    public async publish(
        subject: string,
        payload: RequestEnvelopeInterface,
        opts: RequestOptionsInterface,
    ): Promise<void> {
        const conn = await this.getConnection()
        const headers = this.contextManager.makeHeaders(this.context)

        this.emit('pre:published', {subject: subject, payload: payload, headers: headers, opts: opts})
        await conn.nats.publish(subject, {...payload, headers: headers})
        this.emit('post:published', {subject: subject, payload: payload, headers: headers, opts: opts})
    }

    public async subscribe(
        subject: string,
        listener: Function,
        opts?: SubscribeOptionsInterface,
    ): Promise<void> {
        const subscribeOptions: any = Object.assign({}, opts)
        if (!opts || !('queue' in opts)) {
            subscribeOptions.queue = this.app.name || process.env.npm_package_name
        }

        const conn = await this.getConnection()
        this.middie.use(subject, this.callbackHandler.bind(this, conn, listener))

        this.emit('pre:subscribe', {subject: subject, cb: listener, opts: opts})
        const subscription = await conn.nats.subscribe(
            subject,
            this.requestHandler.bind(this, listener, conn, this.middie),
            subscribeOptions,
        )
        this.emit('post:subscribe', {subscription: subscription, subject: subject, cb: listener, opts: opts})

        this._listeners.push(listener)
        const listeners = this.subscriptions.get(subject) || new WeakMap()
        listeners.set(listener, subscription)
        this.subscriptions.set(subject, listeners)
    }

    public async unsubscribe(subject: string | symbol, listener: (...args: any[]) => void, opts?: any): Promise<void> {
        const listeners = this.subscriptions.get(subject)
        if (listeners) {
            const subscription = listeners.get(listener)
            if (subscription) {
                subscription.unsubscribe(opts)
            }
        }
    }

    public async send(event: string | symbol, args: any): Promise<any> {
        throw new Error('Not implemented "send"')
    }

    public getClientId(): string {
        const hostName = hostname().replace(/\./, '-')
        const serviceName = this.app.name || process.env.npm_package_name
        return `${hostName}_${serviceName}_${process.pid}`
    }

    protected requestHandler(listener, conn, middie, err: NatsError | null, msg: Msg): void {
        const initialRequest = <RequestEnvelopeInterface> {headers: {}, params: {}, query: {}, body: {}}
        const req = Object.assign({url: msg.subject}, initialRequest, msg.data)
        const res: any = {replyTo: msg.reply}

        middie.run(req, res)
    }

    protected async callbackHandler(conn, cb, req, res, done): Promise<void> {
        try {
            const resp = await cb(req, res)
            if (resp instanceof Error) {
                throw resp
            }
            if (typeof res.replyTo === 'string') {
                conn.nats.publish(res.replyTo, resp)
            }
        } catch (e) {
            if (typeof res.replyTo === 'string') {
                conn.nats.publish(res.replyTo, <ResponseEnvelopeInterface> {
                    data: null,
                    error: {
                        id: e.id || undefined,
                        statusCode: e.statusCode,
                        name: e.name,
                        message: e.message,
                        data: e.data || undefined,
                        validation: e.validation || undefined,
                        stack: this.env.isDevMode ? e.stack : undefined,
                    },
                    meta: {},
                })
            }
        } finally {
            done()
        }
    }

    protected async getConnection(): Promise<{nats: NatsClient}> {
        let conn: {nats: NatsClient} | null = this.pool.get('default') || null
        if (!conn) {
            conn = await this.createConnection()
            if (!conn) {
                const error = new RuntimeError('Connection failed')
                this.log.error(RuntimeError.toLog(error), 'Connection failed')
                throw error
            }

            this.pool.set('default', conn)
            this.emit('connected.default', conn)
        }

        return conn
    }

    protected async createConnection(/* tenantId: string, tenantConfig: ConfigInterface */): Promise<{nats: NatsClient} | null> {
        try {
            const clientId = this.getClientId()
            const servers = this.env.config.get<string[]>('nats.connection.servers')
            const options = <NatsConnectionOptions> {
                name: clientId,
                url: servers.shift(),
                encoding: 'utf-8',
                payload: Payload.JSON,
            }

            const user = this.env.config.get<string>('nats.connection.user')
            const pass = this.env.config.get<string>('nats.connection.pass')
            if (user && pass) {
                options.user = user
                options.pass = pass
            }

            const nc = await NATS(options)

            const subject = `${clientId}.health-check`
            nc.subscribe(subject, (err: NatsError | null, msg: Msg): void => {
                if (err) {
                    throw err
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                msg.reply && nc.publish(msg.reply, msg.data)
            })

            const msg = await nc.request(subject, 1_000, {ok: true})
            if (msg.data.ok === true) {
                this.log.info({action: 'connection', tenantId: 'default'}, 'NATS is connected for the tenant')

                return {nats: nc}
            }

            return null
        } catch (ex) {
            this.log.error({error: ex})
            throw ex
        }
    }
}
