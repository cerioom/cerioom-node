import { EventBusTransportInterface } from './event-bus-transport.interface'


export interface EventBusInterface {
    getOneTransport: (kind: string | symbol) => EventBusTransportInterface | null
    getAllTransports: () => EventBusTransportInterface[]

    subscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    unsubscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    publish: (event: string | symbol, ...args: any[]) => Promise<void>
    send: (event: string | symbol, ...args: any[]) => Promise<any>
    request: (event: string | symbol, ...args: any[]) => Promise<any[]>
}
