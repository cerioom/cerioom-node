import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScopeEnum } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export class Service extends EventEmitter implements ServiceInterface {
    private _log: LoggerInterface

    constructor() {
        super()
        this._log = DI.get(Logger).child({
            // @ts-expect-error
            module: this.constructor.name.toLowerCase().includes('ioc') && 'name' in this.constructor.__parent ? this.constructor.__parent.name : this.constructor.name
        })
        this._log.debug('constructed')
    }

    public get context(): ContextInterface {
        return DI.get(ContextManager).getContext(ContextScopeEnum.REQUEST)
    }

    public get log(): LoggerInterface {
        if (!Object.keys(this._log.bindings()).includes('requestId') && this.context.requestId) {
            return this._log.child({requestId: this.context.requestId})
        }

        return this._log
    }
}
