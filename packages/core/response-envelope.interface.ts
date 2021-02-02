export interface ResponseEnvelopeInterface<T = any> {
    data: T | T[]
    meta: {
        total?: number
        offset?: number
        limit?: number
        statusCode?: number
        [k: string]: any
    }
    error?: {
        id?: string
        name?: string
        message: string
        data?: Record<string, string | number>
        validation?: any[]
    }

    [k: string]: any
}
