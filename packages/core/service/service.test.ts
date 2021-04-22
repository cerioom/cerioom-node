import { Context, ContextManager, ContextScope } from '../context'
import { DI } from '../di'
import { Service } from './service'


class ServiceImpl extends Service {

}

describe('Service', () => {
    it('should get context with scope local', () => {
        const service = new ServiceImpl()
        const context = service.getContext()
        expect(context).toBeInstanceOf(Context)
        expect(context.scope).toBe(ContextScope.LOCAL)
    })

    it('should fail get context with scope request', () => {
        const container = new WeakMap().set(ContextManager, new ContextManager(true))

        DI.init((source) => {
            // @ts-ignore
            return container.get(source)
        })

        const service = new ServiceImpl()
        expect(() => service.getContext()).toThrow('Scope "REQUEST" was not initiated');
    })

    it('should fail get context with scope request', () => {
        const contextManager = new ContextManager(true)
        contextManager.setContext(ContextScope.REQUEST, () => {
            const service = new ServiceImpl()
            const context = service.getContext()
            expect(context).toEqual({scope: 'REQUEST'})
        })
    })
})
