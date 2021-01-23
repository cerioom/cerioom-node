import { parse } from 'path'
import * as pino from 'pino'
import { DestinationObjectOptions, DestinationStream } from 'pino'
import * as noir from 'pino-noir'
import { DI } from '../../core/di'
import { Env } from '../../core/env'
import { Logger, LoggerFn, LoggerInterface } from '../../core/logger'


const thisFileName = parse(__filename).name


export class PinoLogger extends Logger {
    protected env = DI.get(Env)
    protected logger: pino.BaseLogger

    constructor(
        opts?: pino.LoggerOptions & {secureTokens?: string[], level?: pino.LevelWithSilent},
        dest?: string | number | DestinationObjectOptions | DestinationStream | NodeJS.WritableStream,
    ) {
        super()
        const defaults = <pino.LoggerOptions> {
            name: this.env.var('npm_package_name') ?? 'app',
            level: this.env.var('LOG_LEVEL') ?? 'info',
            redact: ['req.headers.authorization'],
            timestamp: pino.stdTimeFunctions.isoTime,
            serializers: opts?.secureTokens ? noir(opts.secureTokens, '*****') : {err: pino.stdSerializers.err},
            formatters: {
                level(label, number) {
                    return {level: label}
                },
            },
            // serializers: {
            //     req: function customReqSerializer(req) {
            //         return {
            //             id: req.id,
            //             method: req.method,
            //             url: req.url,
            //             headers: req.headers,
            //             remoteAddress: req.connection.remoteAddress,
            //             remotePort: req.connection.remotePort,
            //         }
            //     },
            // },
        }

        dest = dest ?? {sync: this.env.isDevMode, minLength: this.env.isDevMode ? 0 : 1024}
        const options = {...defaults, ...opts}

        this.logger = pino(options, pino.destination(dest))
        this.logger.debug('Logger initiated')

        // if (['debug', 'trace'].includes(options.level ?? 'info')) {
        //     this.logger = this.traceCaller(this.logger)
        // }
    }

    public bindings(): Record<any, any> {
        return this.logger.bindings()
    }

    public child(bindings: Record<any, any>): LoggerInterface {
        this.logger = this.logger.child(bindings)
        return this
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

    protected call(method: pino.Level, ...args: Parameters<LoggerFn>) {
        // @ts-expect-error
        this.logger[method](...args)
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

        return new Proxy(pinoInstance, {get})
    }
}
