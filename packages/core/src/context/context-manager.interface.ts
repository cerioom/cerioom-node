import { ContextScopeEnum } from './context-manager'
import { ContextInterface } from './context.interface'


export interface ContextManagerInterface {
    connectResponseMiddleware: () => (req, res, next) => void
    setContext: <R>(scope: ContextScopeEnum, callback: (...args: any[]) => R, ...args: any[]) => R
    getContext: () => ContextInterface
}
