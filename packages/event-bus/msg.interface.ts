import { RequestEnvelopeInterface } from '@cerioom/core'


export interface MsgInterface<T> extends RequestEnvelopeInterface {
    kind: string
    messageId: string
    body: T
}
