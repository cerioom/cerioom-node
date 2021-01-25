import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScopeEnum } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export class Service extends EventEmitter implements ServiceInterface {
    private readonly _module: string
    private _log: LoggerInterface | undefined

    constructor () {
        super()
        // @ts-expect-error
        this._module = this.constructor.name.toLowerCase().includes('ioc') && 'name' in this.constructor.__parent ? this.constructor.__parent.name : this.constructor.name
    }

    get context (): ContextInterface {
        return DI.get(ContextManager).getContext(ContextScopeEnum.REQUEST)
    }

    get log (): LoggerInterface {
        if (!this._log) {
            const bindings = <LoggerInterface> this.context.logger.bindings()
            this._log = DI.get(Logger).child({...bindings, module: this._module})
        }

        return this._log
    }
}
