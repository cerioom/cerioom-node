import { RequestEnvelopeInterface, ResponseEnvelopeInterface } from '@cerioom/core'
import { EventBusTransportInterface } from './event-bus-transport.interface'


export interface EventBusInterface {
    getOneTransport: (kind: string | symbol) => EventBusTransportInterface | null
    getAllTransports: () => EventBusTransportInterface[]

    subscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    unsubscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    publish: (event: string | symbol, resp: ResponseEnvelopeInterface) => Promise<void>
    send: (event: string | symbol, resp: ResponseEnvelopeInterface) => Promise<any>
    request: (event: string | symbol, envelope: RequestEnvelopeInterface) => Promise<ResponseEnvelopeInterface>
}
