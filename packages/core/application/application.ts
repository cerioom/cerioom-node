import { ContextInterface, ContextManager, ContextScope } from '../context'
import { DI } from '../di'
import { ParsedVersionInterface, Util } from '../helper'
import { Service } from '../service'
import { ApplicationInterface } from './application.interface'


// https://github.com/zawinul/eng-docs/blob/68c4199e906e09bc1e9e92548df21e887fb412cc/experimental/eng-ms-ts-service/1/src/api-server.ts
// https://tsoa-community.github.io/docs/introduction.html
export class Application extends Service implements ApplicationInterface {
    private readonly _name: string
    private readonly _version: ParsedVersionInterface

    constructor(name?: string, version?: string) {
        super()
        this._name = name ?? 'app'

        this._version = Util.parseVersion(version ?? process.env.npm_package_version ?? '0.0.0')

        process.on('unhandledRejection', this.onUnhandledRejection.bind(this))
        process.on('uncaughtException', this.onUncaughtException.bind(this))

        /*
        const handler = pino.final(loggerInstance, (err, finalLogger, evt) => {
            finalLogger.info(`${evt} caught`)
            if (err) {
                finalLogger.error(err, 'error caused exit')
            }
            process.exit(err ? 1 : 0)
        })
        // catch all the ways node might exit
        process.on('beforeExit', () => handler(null, 'beforeExit'))
        process.on('exit', () => handler(null, 'exit'))
        process.on('uncaughtException', (err) => handler(err, 'uncaughtException'))
        process.on('SIGINT', () => handler(null, 'SIGINT'))
        process.on('SIGQUIT', () => handler(null, 'SIGQUIT'))
        process.on('SIGTERM', () => handler(null, 'SIGTERM'))
        */

        this.emit('constructed', this)
    }


    public get context(): ContextInterface {
        return DI.get(ContextManager).getContext(ContextScope.APP)
    }

    public get name() {
        return this._name
    }

    public get version(): ParsedVersionInterface {
        return this._version
    }

    public onExit(code: number, logger): void {
        if (code > 0) {
            logger.error({action: 'onExit', exitCode: code})
        }
    }

    public onUncaughtException(error: Error, msg: string): void {
        this.log.error({action: 'onUncaughtException', error: {message: error.message}}, error.message)
        process.kill(process.pid, 'SIGINT')
    }

    public onUnhandledRejection(reason, p): void {
        const msg = `Unhandled Rejection at: ${p} reason: ${reason}`
        this.log.error({action: 'onUnhandledRejection', error: {message: msg}}, msg)
        process.kill(process.pid, 'SIGINT')
    }
}
