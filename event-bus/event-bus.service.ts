import { EventBusTransportInterface } from './event-bus-transport.interface'
import { EventBusInterface } from './event-bus.interface'


export class EventBusService implements EventBusInterface {
    protected transports: EventBusTransportInterface[] = []


    constructor(transports: EventBusTransportInterface[]) {
        this.transports = transports
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
    }

    public async send(event: string | symbol, ...args: any): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.send(event, ...args))
        })
        await Promise.all(promises)
    }

    public async request(event: string | symbol, ...args: any[]): Promise<any[]> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.request(event, args))
        })

        return await Promise.all(promises)
    }

    public async unsubscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.unsubscribe(event, listener))
        })
        await Promise.all(promises)
    }

    public async subscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        const promises: any[] = []
        this.transports.forEach(transport => {
            promises.push(transport.subscribe(event, listener))
        })
        await Promise.all(promises)
    }
}
