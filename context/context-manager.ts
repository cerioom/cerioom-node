import { AsyncLocalStorage } from 'async_hooks'
import { Context } from './context'
import { ContextManagerInterface } from './context-manager.interface'
import { ContextInterface } from './context.interface'


const als = new AsyncLocalStorage<ContextInterface>()


export class ContextManager implements ContextManagerInterface {
    public middleware(): (req, res, next) => void {
        return (req, res, next) => {
            try {
                this.setContext(next)
            } catch (e) {
                next(e)
            }
        }
    }

    public setContext<R>(callback: (...args: any[]) => R, ...args: any[]): R {
        return als.run(new Context({}), callback, ...args)
    }

    public getContext(): ContextInterface {
        const store = als.getStore()
        if (!store) {
            throw new Error()
        }

        return store
    }
}
