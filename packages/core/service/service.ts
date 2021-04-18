import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScopeEnum } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export abstract class Service extends EventEmitter implements ServiceInterface {
    private readonly _module: string
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
            let context: ContextInterface

            if (this._context) {
                context = this._context
            } else {
                try {
                    context = this.getContext(ContextScopeEnum.REQUEST)
                } catch (e) {
                    context = this.getContext(ContextScopeEnum.APP)
                }
            }

            const bindings = context.logger ? context.logger.bindings() : {}
            const logger = DI.get(Logger).child({...bindings, module: this._module})
            if (context.scope === ContextScopeEnum.APP) {
                return logger
            }

            this._log = logger
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
