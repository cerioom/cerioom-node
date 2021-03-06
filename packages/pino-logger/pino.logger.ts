import { DI, Env, Logger, LoggerFn, LoggerInterface } from '@cerioom/core'
import { parse } from 'path'
import pino, { DestinationObjectOptions, DestinationStream } from 'pino'
import noir from 'pino-noir'
import P = require('pino')


const thisFileName = parse(__filename).name

// https://stackoverflow.com/questions/61277037/jest-mocking-and-testing-pino-multi-streams-based-on-log-levels
export class PinoLogger extends Logger {
    protected env = DI.get(Env)
    private readonly _logger: LoggerInterface
    private readonly _options: pino.LoggerOptions
    private readonly _destination: P.DestinationStream


    constructor(
        opts: pino.LoggerOptions & {secureTokens?: string[], level?: pino.LevelWithSilent} = {secureTokens: ['password']},
        dest?: string | number | DestinationObjectOptions | DestinationStream | NodeJS.WritableStream,
    ) {
        super()
        const defaults = <pino.LoggerOptions> {
            name: this.env.var('npm_package_name') ?? 'app',
            level: this.env.var('LOG_LEVEL') ?? 'info',
            redact: ['req.headers.authorization'],
            timestamp: pino.stdTimeFunctions.isoTime,
            serializers: noir(opts?.secureTokens, '*****'),
            formatters: {
                level: function(label, number) {
                    return {level: label}
                },
            },
        }

        dest = dest ?? {sync: this.env.isDevMode, minLength: this.env.isDevMode ? 0 : 1024}
        this._options = {...defaults, ...opts}
        this._destination = pino.destination(dest)

        this._logger = pino(this._options, this._destination)
        this._logger.debug('Logger initiated')

        if (['debug', 'trace'].includes(this._options.level ?? 'info')) {
            this._logger = this.traceCaller(this._logger)
        }
    }

    public bindings(): Record<any, any> {
        return this._logger.bindings()
    }

    public child(bindings: Record<any, any>): LoggerInterface {
        const diff = Object.keys(bindings).reduce((diff, key) => {
            if (this._logger.bindings()[key] === bindings[key]) {
                return diff
            }
            return {...diff, [key]: bindings[key]}
        }, {})
        return this._logger.child(diff)
    }

    public fatal(...args): void {
        this.call('fatal', ...args)
    }

    public error(...args): void {
        this.call('error', ...args)
    }

    public warn(...args): void {
        this.call('warn', ...args)
    }

    public info(...args): void {
        this.call('info', ...args)
    }

    public debug(...args): void {
        this.call('debug', ...args)
    }

    public trace(...args): void {
        this.call('trace', ...args)
    }

    protected call(method: pino.Level, ...args: Parameters<LoggerFn>): void {
        this._logger[method](...args)
    }

    protected traceCaller(pinoInstance, basePath?): any {
        const {asJsonSym} = pino.symbols
        const STACKTRACE_OFFSET = this.env.nodeVersion && this.env.nodeVersion > 6 ? 1 : 2
        const LINE_OFFSET = 7
        basePath = (basePath || this.env.var('INIT_CWD'))
        const preBasePath = `${basePath}`.split('/')
        preBasePath.pop()

        function asJson(...args): any {
            args[0] = args[0] || Object.create(null)
            const stack = (new Error().stack ?? '').split('\n')
            args[0].caller = stack
                .filter((s) =>
                    !s.includes('node_modules/pino') &&
                    !s.includes(`/${thisFileName}.ts`) &&
                    !s.includes(`/${thisFileName}.js`) &&
                    !s.includes('node_modules\\pino'),
                )[STACKTRACE_OFFSET]
                .substr(LINE_OFFSET)

            args[0].caller = args[0].caller
                .replace(basePath, '')
                .replace(preBasePath.join('/'), '')

            return pinoInstance[asJsonSym].apply(this, args)
        }

        function get(target, name): string {
            return name === asJsonSym ? asJson : target[name]
        }

        return new Proxy(pinoInstance, {get: get})
    }
}
