import { RuntimeError, Service } from '@cerioom/core'
import { EventBusTransportInterface } from './event-bus-transport.interface'
import { EventBusInterface } from './event-bus.interface'


// https://moleculer.services/docs/0.12/transporters.html
export class EventBusService extends Service implements EventBusInterface {
    protected transports: EventBusTransportInterface[] = []


    constructor(transports: EventBusTransportInterface[]) {
        super()
        if (!transports.length) {
            throw new RuntimeError('Transport for event bus was not defined')
        }

        this.transports = transports
        this.emit('constructed', this)
    }

    public getOneTransport(kind: string | symbol): EventBusTransportInterface | null {
        return this.transports.find(transport => transport.kind === kind) ?? null
    }

    public getAllTransports(): EventBusTransportInterface[] {
        return this.transports
    }

    public async publish(event: string | symbol, ...args: any[]): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.publish(event, args))
        })
        await Promise.all(promises)
        this.emit('published', event, args)
    }

    public async send(event: string | symbol, ...args: any): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.send(event, ...args))
        })
        await Promise.all(promises)
        this.emit('send', event, args)
    }

    public async request(event: string | symbol, ...args: any[]): Promise<any[]> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.request(event, args))
        })

        const results = await Promise.all(promises)
        this.emit('requested', event, args, results)
        return results
    }

    public async unsubscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.unsubscribe(event, listener))
        })
        await Promise.all(promises)
        this.emit('unsubscribe', event, listener)
    }

    public async subscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.subscribe(event, listener))
        })
        await Promise.all(promises)
        this.emit('subscribe', event, listener)
    }
}
