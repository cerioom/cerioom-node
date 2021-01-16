import { EventEmitter } from 'events'
import { ContextInterface, ContextManager, ContextScopeEnum } from '../context'
import { DI } from '../di'
import { Logger, LoggerInterface } from '../logger'
import { ServiceInterface } from './service.interface'


export class Service extends EventEmitter implements ServiceInterface {
    public log: LoggerInterface

    constructor() {
        super()
        this.log = DI.get(Logger).child({
            // @ts-expect-error
            module: this.constructor.name === 'ioc_wrapper' ? this.constructor.__parent.name : this.constructor.name
        })
        this.log.trace('constructed')
    }

    public get context(): ContextInterface {
        return DI.get(ContextManager).getContext(ContextScopeEnum.REQUEST)
    }
}
