import { EventEmitter } from 'events'

interface LogFn {
    (msg?: string, ...args: any[]): void
    (obj: object, msg?: string, ...args: any[]): void
}

export interface LoggerInterface extends EventEmitter {
    child: (bindings: any) => LoggerInterface
    bindings: () => any
    fatal: LogFn
    error: LogFn
    warn: LogFn
    info: LogFn
    debug: LogFn
    trace: LogFn
}
