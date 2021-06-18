import { RequestEnvelopeInterface, ResponseEnvelopeInterface } from '@cerioom/core'
import { MsgInterface } from './msg.interface'


export interface EventBusTransportInterface {
    kind: string

    subscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    unsubscribe: (event: string | symbol, listener: (...args: any[]) => void) => Promise<void>
    publish: (event: string | symbol, msg: MsgInterface, opts?: any) => Promise<void>
    send: (event: string | symbol, msg: MsgInterface, opts?: any) => Promise<any>
    request: (event: string | symbol, data: RequestEnvelopeInterface, opts?: any) => Promise<ResponseEnvelopeInterface>
}
