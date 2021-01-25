export interface ValidationResultInterface {
    path: string
    message: string
    schemaPath?: string
    args?: {
        [type: string]: string
    }
}
