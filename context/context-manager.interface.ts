import { ContextInterface } from './context.interface'


export interface ContextManagerInterface {
    middleware: () => (req, res, next) => void
    setContext: <R>(callback: (...args: any[]) => R, ...args: any[]) => R
    getContext: () => ContextInterface
}
