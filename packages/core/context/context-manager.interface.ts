import { ContextScope } from './context-manager'
import { ContextInterface } from './context.interface'


export interface ContextManagerInterface {
    setContext: <R>(scope: ContextScope, callback: (...args: any[]) => R, ...args: any[]) => R
    getContext: (scope?: ContextScope) => ContextInterface
    makeHeaders(context: ContextInterface): Record<string, string>
    makeContext(headers: Record<string, string>): ContextInterface
}
