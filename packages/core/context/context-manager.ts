import { AsyncLocalStorage } from 'async_hooks'
import * as _ from 'lodash'
import { Context } from './context'
import { ContextManagerInterface } from './context-manager.interface'
import { ContextInterface } from './context.interface'


export enum ContextScope {
    APP = 'APP',
    REQUEST = 'REQUEST',
    LOCAL = 'LOCAL',
}

export class ContextManager implements ContextManagerInterface {

    public constructor(
        public readonly strictScope = false
    ) {
    }

    /**
     * Middleware to setup context for request
     *
     * ```ts
     * const app = express()
     * const contextManager = DI.get(ContextManager)
     * app.use(contextManager.connectMiddleware())
     * ````
     */
    public connectMiddleware(): (req, res, next) => void {
        return function contextRequest(req, res, next) {
            try {
                // @ts-ignore
                this.setContext(ContextScope.REQUEST, next)
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
    public setContext<R>(scope: ContextScope, callback: (...args: any[]) => R, ...args: any[]): R {
        // @ts-ignore
        const als = global.__cerioom.scopes.get(scope)
        if (!als) {
            throw new Error(`Scope "${scope}" was not initiated`)
        }

        const context = new Context({scope: scope})
        return als.run(context, callback, ...args)
    }

    /**
     * Get context
     *
     * @param scope
     */
    public getContext(scope: ContextScope = ContextScope.REQUEST): ContextInterface {
        // @ts-ignore
        const context = global.__cerioom?.scopes?.get(scope)?.getStore()
        if (context) {
            return context
        }

        if (this.strictScope) {
            throw new Error(`Scope "${scope}" was not initiated`)
        }

        return new Context({scope: ContextScope.LOCAL})
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
global.__cerioom = Object.assign({}, global.__cerioom, {
    scopes: new Map<string, AsyncLocalStorage<ContextInterface>>()
        .set(ContextScope.APP, new AsyncLocalStorage<ContextInterface>())
        .set(ContextScope.REQUEST, new AsyncLocalStorage<ContextInterface>()),
})
