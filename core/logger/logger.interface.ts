export interface LoggerFn {
    (msg?: string, ...args: any[]): void
    (obj?: object, msg?: string, ...args: any[]): void
}

export interface LoggerInterface {
    child: (bindings: Record<any, any>) => LoggerInterface
    bindings: () => Record<any, any>

    fatal: LoggerFn
    error: LoggerFn
    warn: LoggerFn
    info: LoggerFn
    debug: LoggerFn
    trace: LoggerFn
}
