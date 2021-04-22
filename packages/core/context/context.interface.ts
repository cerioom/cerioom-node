import { ContextScope } from './context-manager'


export interface ContextInterface {
    [key: string]: any

    set: (key: string, value: object | string | number | bigint | boolean | symbol | null) => this
    get: <T extends any>(key, defaultValue?) => T
    destroy: () => void
    toJSON: () => object
    toString: () => string
    readonly scope: ContextScope
}
