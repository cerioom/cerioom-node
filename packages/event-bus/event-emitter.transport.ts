import { ResponseEnvelopeInterface, Str } from '@cerioom/core'
import { ConstructorOptions, EventEmitter2 } from 'eventemitter2'
import { EventBusTransportInterface } from './event-bus-transport.interface'
import { MsgInterface } from './msg.interface'


export class EventEmitterTransport implements EventBusTransportInterface {
    public readonly kind = 'event-emitter'

    protected id: string
    protected eventEmitter2: EventEmitter2

    constructor(opts?: ConstructorOptions) {
        this.id = Str.random()
        this.eventEmitter2 = new EventEmitter2(opts)
    }

    public async publish(event: string | symbol, msg: MsgInterface<ResponseEnvelopeInterface>, options?: any): Promise<void> {
        await this.eventEmitter2.emitAsync(event, msg, options)
    }

    public async send(event: string | symbol, msg: MsgInterface<ResponseEnvelopeInterface>, options?: any): Promise<void> {
        throw new Error('Not implemented "send"')
    }

    public async request(event: string | symbol, msg: MsgInterface<any>, options?: any): Promise<any> {
        return (await this.eventEmitter2.emitAsync(event, msg, options)).find(resp => resp !== undefined)
    }

    public async subscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        this.eventEmitter2.on(event, listener)
    }

    public async unsubscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
        this.eventEmitter2.off(event, listener)
    }
}
