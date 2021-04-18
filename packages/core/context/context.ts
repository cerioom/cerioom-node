import { inspect } from 'util'
import { Config } from '../config'
import { ContextScopeEnum } from './context-manager'
import { ContextInterface } from './context.interface'


export class Context extends Config implements ContextInterface {
    public readonly scope: ContextScopeEnum

    public destroy(): void {
        Object.getOwnPropertyNames(this).forEach((key) => {
            try {
                Object.defineProperty(this, key, {value: null, writable: true})
                this[key] = null
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this[key]
            } catch (e) {
                // nothing
            }
        })
    }

    public toString(): string {
        return inspect(this)
    }
}
