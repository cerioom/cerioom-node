import { LoggerFn, LoggerInterface } from './logger.interface'


export class Logger implements LoggerInterface {
    protected _bindings: Record<any, any> = {}


    public child(bindings: Record<any, any>): LoggerInterface {
        this._bindings = {...this._bindings, ...bindings}
        return this
    }

    public bindings(...args: any[]): Record<any, any> {
        return this._bindings
    }

    public fatal(...args: any[]): void {
        this.call('error', args)
    }

    public error(...args: any[]): void {
        this.call('error', args)
    }

    public warn(...args: any[]): void {
        this.call('warn', args)
    }

    public info(...args: any[]): void {
        this.call('info', args)
    }

    public debug(...args: any[]): void {
        this.call('debug', args)
    }

    public trace(...args: any[]): void {
        this.call('trace', args)
    }

    protected call(method: string, args: Parameters<LoggerFn>): void {
        const _msg: string[] = []
        const _args: any = args.filter(arg => {
            if (typeof arg !== 'object') {
                _msg.push(String(arg))
                return false
            }

            return true
        })

        if (_msg.length) {
            _args.push({msg: _msg.join(' ')})
        }

        console[method](Object.assign({level: method}, this._bindings, ..._args))
    }
}
