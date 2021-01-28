import { ValidationResultInterface } from './validation-result.interface'


export interface ErrorInterface extends Error {
    id: string
    name: string
    getValidation: () => ValidationResultInterface[] | undefined
    setValidation: (validation: ValidationResultInterface[]) => this
    setCause: (cause: ErrorInterface) => this
    setData: (data: Record<string, string | number>) => this
    getData: () => Record<string, string | number>
    setLoggable: (value: boolean) => this
    getLoggable: () => boolean
    toJSON: () => any
}
