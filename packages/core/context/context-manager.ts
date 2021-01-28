import { AsyncLocalStorage } from 'async_hooks'
import { Context } from './context'
import { ContextManagerInterface } from './context-manager.interface'
import { ContextInterface } from './context.interface'


export enum ContextScopeEnum {
    APP = 'APP',
    REQUEST = 'REQUEST'
}

export class ContextManager implements ContextManagerInterface {

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

    public setContext<R>(scope: ContextScopeEnum, callback: (...args: any[]) => R, ...args: any[]): R {
        const als = scopes.get(scope)
        if (!als) {
            throw new ReferenceError(`Scope "${scope}" was not initiated`)
        }

        const context = new Context({scope: scope})
        return als.run(context, callback, ...args)
    }

    public getContext(scope: ContextScopeEnum = ContextScopeEnum.REQUEST): ContextInterface {
        if (!scopes.has(scope) && !scopes.has(ContextScopeEnum.APP)) {
            throw new ReferenceError('Scopes were not initiated')
        }

        // @ts-expect-error
        let store = scopes.get(scope).getStore()
        if (!store) {
            // @ts-expect-error
            store = scopes.get(ContextScopeEnum.APP).getStore()
        }

        if (!store) {
            throw new ReferenceError(`Scope "${scope}" storage was not initiated`)
        }

        return store
    }
}

const scopes = new Map<string, AsyncLocalStorage<ContextInterface>>()
    .set(ContextScopeEnum.APP, new AsyncLocalStorage<ContextInterface>())
    .set(ContextScopeEnum.REQUEST, new AsyncLocalStorage<ContextInterface>())
