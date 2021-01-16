import * as pino from 'pino'
import { DI } from '../../core/di'
import { LoggerInterface, LoggerFn } from '../../core/logger'


export class PinoLogger implements LoggerInterface {

    public bindings(): Record<any, any> {
        return undefined;
    }

    public child(bindings: Record<any, any>): LoggerInterface {
        return undefined;
    }

    public debug: LoggerFn
    public error: LoggerFn
    public fatal: LoggerFn
    public info: LoggerFn
    public trace: LoggerFn
    public warn: LoggerFn

    private call(method: pino.Level, ...args: Parameters<LoggerFn>) {
        const context = this.context
        if (context) {
            const firstArg = args[0]
            if (typeof firstArg === 'object') {
                if (firstArg instanceof Error) {
                    args = [
                        Object.assign({[this.contextName]: context}, {err: firstArg}),
                        ...args.slice(1),
                    ]
                } else {
                    args = [
                        Object.assign({[this.contextName]: context}, firstArg),
                        ...args.slice(1),
                    ]
                }
            } else {
                args = [{[this.contextName]: context}, ...args]
            }
        }

        (this.logger[method] as any)(...args)
    }

    private get logger() {
        return DI.get(Logg)
    }
}
