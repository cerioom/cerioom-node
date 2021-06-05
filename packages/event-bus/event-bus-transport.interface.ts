import { RequestEnvelopeInterface, ResponseEnvelopeInterface } from '@cerioom/core'

export interface MsgInterface {
    kind: string
    messageId: string
    headers: Record<string, string>
    params: Record<string, string>
    query: object
    body: ResponseEnvelopeInterface
}

export interface EventBusTransportInterface {
    kind: string

    subscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    unsubscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    publish: (event: string | symbol, msg: MsgInterface) => Promise<void>
    send: (event: string | symbol, msg: MsgInterface) => Promise<any>
    request: (event: string | symbol, data: RequestEnvelopeInterface) => Promise<ResponseEnvelopeInterface[]>
}
