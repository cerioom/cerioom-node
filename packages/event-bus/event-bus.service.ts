import { RequestEnvelopeInterface, ResponseEnvelopeInterface, RuntimeError, Service, Str } from '@cerioom/core'
import { EventBusTransportInterface } from './event-bus-transport.interface'
import { EventBusInterface } from './event-bus.interface'


// https://moleculer.services/docs/0.12/transporters.html

export class EventBusService extends Service implements EventBusInterface {
    protected transports: EventBusTransportInterface[] = []


    constructor(transports: EventBusTransportInterface[]) {
        super()
        if (!transports?.length) {
            throw new RuntimeError('Transport for event bus was not defined')
        }

        this.transports = transports
        this.emit('cerioom.event-bus.event-bus-service.constructed', this)
    }

    public getOneTransport(kind: string | symbol): EventBusTransportInterface | null {
        return this.transports.find(transport => transport.kind === kind) ?? null
    }

    public getAllTransports(): EventBusTransportInterface[] {
        return this.transports
    }

    public async publish(event: string | symbol, body: ResponseEnvelopeInterface, options?: any): Promise<void> {
        const msg = {body: body, route: String(event), messageId: Str.random()}
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.publish(event, {...msg, kind: transport.kind}, options))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.published', event, msg, options)
    }

    public async send(event: string | symbol, body: ResponseEnvelopeInterface, options?: any): Promise<void> {
        const msg = {body: body, route: String(event), messageId: Str.random()}
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.send(event, {...msg, kind: transport.kind}, options))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.sent', event, msg)
    }

    public async request(event: string | symbol, msg: RequestEnvelopeInterface, options?: any): Promise<any> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.request(event, {...msg, body: msg.body, kind: transport.kind, route: String(event), messageId: Str.random()}, options))
        })

        const results = await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.requested', event, msg, results)
        return results
    }

    public async unsubscribe(event: string | symbol, listener: (req: any) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.unsubscribe(event, listener))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.unsubscribed', event, listener)
    }

    public async subscribe(event: string | symbol, listener: (req: any) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.subscribe(event, listener))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.subscribed', event, listener)
    }
}
