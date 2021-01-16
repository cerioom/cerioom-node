export interface EventBusTransportInterface {
    kind: string

    subscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    unsubscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    publish: (event: string | symbol, ...args: any[]) => Promise<void>
    send: (event: string | symbol, ...args: any[]) => Promise<any>
    request: (event: string | symbol, ...args: any[]) => Promise<any[]>
}
