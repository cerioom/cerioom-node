import {MsgHdrs} from 'nats'

export interface RequestOptionsInterface {
    queue?: string | false
    timeout?: number
    original?: {[key: string]: any}
    headers: MsgHdrs
}
