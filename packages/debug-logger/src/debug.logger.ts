import { LoggerFn, LoggerInterface } from '../core/logger'
var debug = require('debug')

const a = debug('aa')
a('aaaaaa')

export class DebugLogger implements LoggerInterface {
    protected _bindings: Record<any, any> = {}
    protected _logger: any

    constructor(namespace: string = '') {
        this._logger = debug(namespace)
    }

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

        // console[method](Object.assign({level: method}, this._bindings, ..._args))
        // debug(Object.assign({level: method}, this._bindings, ..._args))
        this._logger('test')
        a('111')
    }
}
