export interface ResourceEnvelopeInterface<T = any> {
    data: T | T[]
    meta: {
        total?: number
        offset?: number
        limit?: number
        [k: string]: any
    }

    [k: string]: any
}
