import { ContextInterface } from '../context'
import { LoggerInterface } from './logger.interface'


export class Logger implements LoggerInterface {
    protected _bindings: Record<any, any> = {}
    protected _context: ContextInterface | undefined

    constructor(context?: ContextInterface) {
        this._context = context
    }

    public child(bindings: Record<any, any>): LoggerInterface {
        this._bindings = {...this._bindings, bindings}
        return this
    }

    public bindings(...args: any[]): Record<any, any> {
        return this._bindings
    }

    public fatal(...args: any[]): void {
        console.error(...args)
    }

    public error(...args: any[]): void {
        console.error(...args)
    }

    public warn(...args: any[]): void {
        console.warn(...args)
    }

    public info(...args: any[]): void {
        console.info(...args)
    }

    public debug(...args: any[]): void {
        console.debug(...args)
    }

    public trace(...args: any[]): void {
        console.trace(...args)
    }
}
