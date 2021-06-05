import { RuntimeError, Service, Str } from '@cerioom/core'
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

    public async publish(event: string | symbol, ...args: any[]): Promise<void> {
        const req = {kind: '', event: event, messageId: Str.random(), headers: {}, params: {}, query: {}, body: args}
        const promises: any[] = []
        this.transports.forEach(transport => {
            req.kind = transport.kind
            promises.push(transport.publish(event, req))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.published', event, req)
    }

    public async send(event: string | symbol, ...args: any): Promise<void> {
        const req = {kind: '', event: event, messageId: Str.random(), headers: {}, params: {}, query: {}, body: args}
        const promises: any[] = []
        this.transports.forEach(transport => {
            req.kind = transport.kind
            promises.push(transport.send(event, req))
        })
        await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.sent', event, req)
    }

    public async request(event: string | symbol, ...args: any[]): Promise<any[]> {
        const req = {kind: '', event: event, messageId: Str.random(), headers: {}, params: {}, query: {}, body: args}
        const promises: any[] = []
        this.transports.forEach(transport => {
            req.kind = transport.kind
            promises.push(transport.request(event, req))
        })

        const results = await Promise.all(promises)
        this.emit('cerioom.event-bus.event-bus-service.requested', event, req, results)
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
