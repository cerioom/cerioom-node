import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScope } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export abstract class Service extends EventEmitter implements ServiceInterface {
    private _module: string
    private _log: LoggerInterface | undefined
    private _context: ContextInterface


    public constructor() {
        super()

        // typescript-ioc hack
        this._module = this.constructor.name.toLowerCase().includes('ioc')
        // @ts-expect-error
        && 'name' in this.constructor.__parent ? this.constructor.__parent.name : this.constructor.name
    }

    public get context(): ContextInterface {
        return this.getContext()
    }

    public getContext(scope: ContextScope = ContextScope.REQUEST): ContextInterface {
        if (!this._context) {
            this._context = DI.get(ContextManager).getContext(scope)
        }
        return this._context
    }

    public setContext(context: ContextInterface): this {
        this._context = context
        return this
    }

    public get log(): LoggerInterface {
        if (!this._log) {
            let bindings

            if (this._context?.logger) {
                bindings = this._context.logger.bindings()
            } else {
                try {
                    bindings = this.getContext(ContextScope.REQUEST).logger?.bindings() || {}
                } catch (e) {
                    bindings = {}
                }
            }

            this._log = DI.get(Logger).child({...bindings, module: this._module})
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
