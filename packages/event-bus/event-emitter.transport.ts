import { EventEmitter2 } from 'eventemitter2'
import { EventBusTransportInterface } from './'


export class EventEmitterTransport implements EventBusTransportInterface {
    public readonly kind = 'event-emitter'

    protected eventEmitter2: EventEmitter2

    constructor(opts?) {
        this.eventEmitter2 = new EventEmitter2(opts)
    }

    public async publish(event: string | symbol, ...values: any[]): Promise<void> {
        await this.eventEmitter2.emitAsync(event, ...values)
    }

    public async send(event: string | symbol, ...values: any[]): Promise<any> {
        throw new Error('Not implemented "send"')
    }

    public async request(event: string | symbol, ...values: any[]): Promise<any[]> {
        return await this.eventEmitter2.emitAsync(event, ...values)
    }

    public async subscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        this.eventEmitter2.on(event, listener)
    }

    public async unsubscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        this.eventEmitter2.off(event, listener)
    }
}
