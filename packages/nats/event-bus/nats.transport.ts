import {hostname} from 'os'
import {
    Application,
    ContextManager,
    ContextScope,
    DI,
    Env,
    Mw,
    RequestEnvelopeInterface,
    ResponseEnvelopeInterface,
    RuntimeError,
    Service,
    Str
} from '@cerioom/core'
import {EventBusTransportInterface, MsgInterface} from '@cerioom/event-bus'
import {
    connect,
    ConnectionOptions,
    headers,
    JSONCodec,
    Msg,
    NatsConnection as NatsClient,
    NatsError,
    Subscription,
} from 'nats'
import {SubscribeOptionsInterface} from './subscribe-options.interface'


export class NatsTransport extends Service implements EventBusTransportInterface {
    public readonly kind = 'nats'

    protected id: string

    protected readonly DEFAULT_REQUEST_TIMEOUT_MS
    protected readonly pool: Map<string, NatsClient> = new Map()
    protected subscriptions: Map<string | symbol, WeakMap<Function, Subscription>> = new Map()
    private readonly _listeners: Function[] = []

    protected env = DI.get(Env)
    protected mw = DI.get(Mw)
    protected application = DI.get(Application)
    protected contextManager = DI.get(ContextManager)


    constructor () {
        super()

        this.id = Str.random()

        this.DEFAULT_REQUEST_TIMEOUT_MS = this.env.isDevMode ? 30_000 : 1_500

        process.on('exit', async () => {
            this.log.warn('onExit')
            await this.gracefulUnSubscribeAll()
        })
    }

    public async gracefulUnSubscribeAll (): Promise<void> {
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

    public async request (
        event: string,
        msg: MsgInterface<any>,
        options?: any
    ): Promise<ResponseEnvelopeInterface> {
        const nats = await this.getConnection()
        const jc = JSONCodec()
        const msgHdrs = headers()
        const contextHeaders = this.contextManager.makeHeaders(this.context)
        const incomingHeaders = options?.headers ? {...contextHeaders, ...options.headers} : contextHeaders
        for (const key of Object.keys(incomingHeaders)) {
            if (incomingHeaders[key] !== undefined) {
                msgHdrs.append(key, incomingHeaders[key])
            }
        }

        const opts = {
            timeout: this.DEFAULT_REQUEST_TIMEOUT_MS, // todo
            ...options,
            headers: msgHdrs,
        }
        this.emit('cerioom.nats.event-bus.nats-transport.request:pre', {event: event, msg: msg, opts: opts})
        const respMsg = await nats.request(event, jc.encode(msg), opts)
        const result = jc.decode(respMsg.data) as ResponseEnvelopeInterface
        this.emit('cerioom.nats.event-bus.nats-transport.request:post', {event: event, msg: msg, opts: opts, response: [result]})

        return result
    }

    public async publish (
        event: string,
        msg: MsgInterface<ResponseEnvelopeInterface>,
        options?: any,
    ): Promise<void> {
        try {
            const nats = await this.getConnection()
            const jc = JSONCodec()
            const msgHdrs = headers()
            const contextHeaders = this.contextManager.makeHeaders(this.context)
            const incomingHeaders = options?.headers ? {...contextHeaders, ...options.headers} : contextHeaders
            for (const key of Object.keys(incomingHeaders)) {
                if (incomingHeaders[key] !== undefined) {
                    msgHdrs.append(key, incomingHeaders[key])
                }
            }

            const opts = {
                timeout: this.DEFAULT_REQUEST_TIMEOUT_MS, // todo
                ...options,
                headers: msgHdrs,
            }

            this.emit('cerioom.nats.event-bus.nats-transport.published:pre', {event: event, msg: msg, opts: opts})
            await nats.publish(event, jc.encode(msg), opts)
            this.emit('cerioom.nats.event-bus.nats-transport.published:post', {event: event, msg: msg, opts: opts})
        } catch (err) {
            this.log.error({error: RuntimeError.toLog(err)})
            throw err
        }
    }

    public async subscribe (
        subject: string,
        listener: Function,
        opts?: SubscribeOptionsInterface,
    ): Promise<void> {
        const subscribeOptions: any = Object.assign({}, opts)
        if (!opts || !('queue' in opts)) {
            subscribeOptions.queue = this.application.name || process.env.npm_package_name
        }

        this.emit('pre:subscribe', {
            subject: subject,
            cb: listener,
            opts: opts
        })
        const nats = await this.getConnection()
        const subscription = await nats.subscribe(
            subject,
            {
                ...subscribeOptions,
                callback: this.callback.bind(this)
            },
        )

        function toRegexp(subject: string): RegExp {
            const exp = subject
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
                .replace(/>$/, '.*')
            return new RegExp(exp)
        }

        this.mw.use(async function (matcher: RegExp, req, res, done) {
            if (!matcher.test(req.route)) {
                return await done()
            }

            try {
                const result = await listener(req, res)
                if (result?.error instanceof Error) {
                    throw result.error
                }
                if (res?.reply) {
                    await this.publish(res.reply, result)
                }
                done()
            } catch (err) {
                if (res?.reply) {
                    await this.publish(res.reply, <ResponseEnvelopeInterface> {
                        error: RuntimeError.toJSON(err),
                    })
                    done()
                } else {
                    this.log.error({error: RuntimeError.toLog(err)})
                    done(err)
                }
            }
        }.bind(this, toRegexp(subject)))

        this.emit('post:subscribe', {
            subscription: subscription,
            subject: subject,
            cb: listener,
            opts: opts
        })

        this._listeners.push(listener)
        const listeners = this.subscriptions.get(subject) ?? new WeakMap()
        listeners.set(listener, subscription)
        this.subscriptions.set(subject, listeners)
    }

    public async unsubscribe (subject: string | symbol, listener: (...args: any[]) => void, opts?: any): Promise<void> {
        const listeners = this.subscriptions.get(subject)
        if (listeners) {
            const subscription = listeners.get(listener)
            if (subscription) {
                subscription.unsubscribe(opts)
            }
        }
    }

    public async send (event: string | symbol, args: any): Promise<any> {
        throw new Error('Not implemented "send"')
    }

    public getClientId (): string {
        const hostName = hostname().replace(/\./, '-')
        const serviceName = this.application.name || process.env.npm_package_name
        return `${hostName}_${serviceName}_${process.pid}`
    }

    protected callback (err: NatsError | null, msg: Msg): void {
        const headers = {}
        if (msg.headers) {
            for (const [key] of msg.headers) {
                headers[`x-${key}`] = msg.headers.get(key)
            }
        }

        const initialRequest = <RequestEnvelopeInterface> {
            ip: '::1', // todo
            hosts: '', // todo
            protocol: 'nats',
            route: msg.subject,
            headers: {},
            params: {},
            query: {},
            body: {},
        }
        const req = Object.assign({}, initialRequest, JSONCodec().decode(msg.data), {headers: headers})
        const natsTransport = this
        const res: any = {
            headers: {},
            reply: msg.reply,
            setHeader: function (key, value) {
                this.headers[key] = value
            },
            send: async function (data: any) {
                if (msg.reply) {
                    await natsTransport.publish(msg.reply, data)
                }
            },
            json: this.send
        }

        DI.get(ContextManager).setContext(ContextScope.REQUEST, () => {
            this.log.info({}, 'request start')
            this.mw.run(req, res, (req, res) => {
                this.log.info({}, 'request finish')
            })
        })
    }

    protected async getConnection (): Promise<NatsClient> {
        let nats = this.pool.get('default') ?? null
        if (nats) {
            if (nats instanceof Promise) {
                await nats;
            }
        } else {
            const servers = this.env.config.get<string[]>('nats.connection.servers')
            const options = <ConnectionOptions>{
                name: this.getClientId(),
                servers: servers,
                noRandomize: true,
                reconnect: true,
            }

            const user = this.env.config.get<string>('nats.connection.user')
            const pass = this.env.config.get<string>('nats.connection.pass')
            if (user && pass) {
                options.user = user
                options.pass = pass
            }

            // @ts-ignore
            nats = connect(options)
            // @ts-ignore
            this.pool.set('default', nats)

            try {
                // @ts-ignore
                nats = await nats
                // @ts-ignore
                this.pool.set('default', nats)

                const jc = JSONCodec<{ ok: boolean }>()

                const subject = `${options.name}.health-check`
                const callback = (err: NatsError | null, msg: Msg): void => {
                    if (err) {
                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                        throw err
                    }
                    msg.respond(msg.data)
                }
                nats?.subscribe(subject, {callback: callback})

                setImmediate(async () => {
                    const msg = await nats?.request(subject, jc.encode({ok: true}), {timeout: 1_000})
                    const payload = jc.decode(msg!.data)
                    if (payload.ok) {
                        this.log.info({action: 'connection', tenantId: 'default'}, 'NATS is connected for the tenant')
                    }
                })
            } catch (err) {
                this.pool.delete('default');
                // this.log.warn({ ...logData, error: err });
                throw err;
            }
        }

        this.emit('connected.default', nats)

        // @ts-ignore
        return nats
    }

    protected async createConnection (/* tenantId: string, tenantConfig: ConfigInterface */): Promise<NatsClient | null> {
        try {
            const clientId = this.getClientId()
            const servers = this.env.config.get<string[]>('nats.connection.servers')
            const options = <ConnectionOptions>{
                name: clientId,
                servers: servers,
                noRandomize: true,
                reconnect: true,
            }

            const user = this.env.config.get<string>('nats.connection.user')
            const pass = this.env.config.get<string>('nats.connection.pass')
            if (user && pass) {
                options.user = user
                options.pass = pass
            }

            const nats = await connect(options)
            const jc = JSONCodec<{ ok: boolean }>()

            const subject = `${clientId}.health-check`
            const callback = (err: NatsError | null, msg: Msg): void => {
                if (err) {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw err
                }
                // msg.reply && nc.publish(msg.reply, msg.data)
                msg.respond(msg.data)
            }
            nats.subscribe(subject, {callback: callback})

            setImmediate(async () => {
                const msg = await nats.request(subject, jc.encode({ok: true}), {timeout: 1_000})
                const payload = jc.decode(msg.data)
                if (payload.ok) {
                    this.log.info({action: 'connection', tenantId: 'default'}, 'NATS is connected for the tenant')
                }
            })

            return nats
        } catch (err) {
            this.log.error({error: RuntimeError.toLog(err)})
            throw err
        }
    }
}
