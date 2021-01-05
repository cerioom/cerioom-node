import { getModuleName } from '@atriory/common/helper/ioc-wrapper.helper'
import { Container } from '@atriory/common/ioc'
import { createLogger } from '@atriory/common/logger'
import { ContextManager } from './context'
import { EventEmitter2 } from 'eventemitter2'
import { LoggerInterface } from './log/logger.interface'


export class Service extends EventEmitter2 {
    private readonly _moduleName: string
    private _log: LoggerInterface

    constructor() {
        super({wildcard: true, delimiter: '.'}) // todo take from config
        this._moduleName = getModuleName(this)
    }

    protected getModuleName(): string {
        return this._moduleName
    }

    protected get context() {
        return Container.get(ContextManager).getContext()
    }

    protected set log(log: LoggerInterface) {
        this._log = log
    }

    protected get log(): LoggerInterface {
        if (!this._log) {
            try {
                this._log = createLogger().child({
                    requestId: this.context.requestId,
                    module: this.getModuleName()
                })
            } catch (e) {
                this._log = createLogger()
            }
        }

        return this._log
    }
}
