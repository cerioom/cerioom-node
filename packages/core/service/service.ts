import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScopeEnum } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export abstract class Service extends EventEmitter implements ServiceInterface {
    private _module: string
    private _log: LoggerInterface | undefined
    private _context: ContextInterface


    protected constructor() {
        super()

        // typescript-ioc hack
        this._module = this.constructor.name.toLowerCase().includes('ioc')
        // @ts-expect-error
        && 'name' in this.constructor.__parent ? this.constructor.__parent.name : this.constructor.name
    }

    public get context(): ContextInterface {
        return this._context
    }

    public getContext(scope: ContextScopeEnum = ContextScopeEnum.REQUEST): ContextInterface {
        return DI.get(ContextManager).getContext(scope)
    }

    public setContext(context: ContextInterface): this {
        this._context = context
        return this
    }

    public get log(): LoggerInterface {
        if (!this._log) {
            let parentLogger: LoggerInterface

            if (this._context?.logger) {
                parentLogger = this._context.logger
            } else {
                try {
                    parentLogger = this.getContext(ContextScopeEnum.REQUEST).logger || new Logger()
                } catch (e) {
                    parentLogger = new Logger()
                }
            }

            const bindings = parentLogger?.bindings() || {}
            this._log = parentLogger.child({...bindings, module: this._module})
        }

        return this._log
    }

    public getModuleName(): string {
        return this._module
    }

    public configure(opts: Record<string, any>): this {
        return this
    }
}
