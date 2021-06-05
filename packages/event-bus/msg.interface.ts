import { ResponseEnvelopeInterface } from '@cerioom/core/index'


export interface MsgInterface {
    kind: string
    messageId: string
    headers: Record<string, string>
    params: Record<string, string>
    query: object
    body: ResponseEnvelopeInterface
}
