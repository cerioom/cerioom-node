import { EventBusTransportInterface } from '../../event-bus'


export class NatsTransport implements EventBusTransportInterface {
    public readonly kind = 'nats'


    public async publish(event: string | symbol, args: any): Promise<void> {
    }

    public async request(event: string | symbol, args: any): Promise<any[]> {
        return Promise.resolve([])
    }

    public async send(event: string | symbol, args: any): Promise<any> {
    }

    public async subscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
    }

    public async unsubscribe(event: string | symbol, listener: (...args: any[]) => void): Promise<void> {
    }
}
