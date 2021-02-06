import { AsyncLocalStorage } from 'async_hooks'
import { Context } from './context'
import { ContextManagerInterface } from './context-manager.interface'
import { ContextInterface } from './context.interface'
import * as _ from 'lodash'


export enum ContextScopeEnum {
    APP = 'APP',
    REQUEST = 'REQUEST'
}

export class ContextManager implements ContextManagerInterface {

    /**
     * Middleware to setup context for request
     *
     * ```ts
     * const app = express()
     * const contextManager = DI.get(ContextManager)
     * app.use(contextManager.connectResponseMiddleware())
     * ````
     */
    public connectResponseMiddleware(): (req, res, next) => void {
        return function contextRequest(req, res, next) {
            try {
                // @ts-ignore
                this.setContext(ContextScopeEnum.REQUEST, next)
            } catch (e) {
                next(e)
            }
        }.bind(this)
    }

    /**
     * Set context
     *
     * @param scope
     * @param callback
     * @param args
     */
    public setContext<R>(scope: ContextScopeEnum, callback: (...args: any[]) => R, ...args: any[]): R {
        // @ts-ignore
        const als = global.__cerioom.scopes.get(scope)
        if (!als) {
            throw new ReferenceError(`Scope "${scope}" was not initiated`)
        }

        const context = new Context({scope: scope})
        return als.run(context, callback, ...args)
    }

    /**
     * Get context
     *
     * @param scope
     */
    public getContext(scope: ContextScopeEnum = ContextScopeEnum.REQUEST): ContextInterface {
        // @ts-ignore
        if (!global.__cerioom.scopes.has(scope) && !global.__cerioom.scopes.has(ContextScopeEnum.APP)) {
            throw new ReferenceError('Scopes were not initiated')
        }

        // @ts-ignore
        const store = global.__cerioom.scopes.get(scope)?.getStore()
        if (!store) {
            throw new ReferenceError(`Scope "${scope}" was not initiated`)
        }

        return store
    }

    /**
     * Make headers from context
     */
    public makeHeaders(context: ContextInterface): Record<string, string> {
        return Object.keys(context).reduce((prev, key) => {
            prev[_.kebabCase(key)] = context[key] // todo js serialize
            return prev
        }, {})
    }

    /**
     * Make context from headers
     */
    public makeContext(headers: Record<string, string>): ContextInterface {
        const data = Object.keys(headers).reduce((prev, key) => {
            prev[_.camelCase(key)] = headers[key] // todo js deserialize
            return prev
        }, {})

        return new Context(data)
    }
}

// @ts-ignore
global.__cerioom.scopes = new Map<string, AsyncLocalStorage<ContextInterface>>()
    .set(ContextScopeEnum.APP, new AsyncLocalStorage<ContextInterface>())
    .set(ContextScopeEnum.REQUEST, new AsyncLocalStorage<ContextInterface>())
