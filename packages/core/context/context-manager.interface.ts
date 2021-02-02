import { ContextScopeEnum } from './context-manager'
import { ContextInterface } from './context.interface'


export interface ContextManagerInterface {
    connectResponseMiddleware: () => (req, res, next) => void
    setContext: <R>(scope: ContextScopeEnum, callback: (...args: any[]) => R, ...args: any[]) => R
    getContext: () => ContextInterface
    makeHeaders(context: ContextInterface): Record<string, string>
    makeContext(headers: Record<string, string>): ContextInterface
}
