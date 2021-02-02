export interface RequestEnvelopeInterface {
    headers?: Record<string, string>
    params?: Record<string, string>
    query?: {
        filter?: object
        limit?: number | null
        offset?: number | null
        sort?: object
        [key: string]: any
    }
    body?: {
        [key: string]: any
    }

    [key: string]: any
}
