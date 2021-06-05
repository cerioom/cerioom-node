import { Context } from './context'
import { ContextManager } from './context-manager'


describe('context-manager', () => {
    it('make headers', () => {
        const tenant: any = {id: 'demo', config: {prm1: 'val1'}}
        const context = new Context({
            a: 1,
            b: '2',
            c: true,
            d: {d1: 1},
            tenant: tenant
        })
        const cm = new ContextManager()
        cm.addSerializer('tenant', {
            serialize: (data) => {
                return {
                    ['tenant-id']: data.id
                }
            }
        })
        const actual = cm.makeHeaders(context)
        expect(actual).toEqual({'a':'1','b':'"2"','c':'true','d':'{"d1":1}','tenant-id':'demo'})
    })

    it('make context', () => {
        const headers = {
            a: '1',
            b: '"2"',
            c: 'true',
            d: '{"d1": 1}',
            'tenant-id': 'demo'
        }
        const cm = new ContextManager()
        cm.addDeserializer('tenant-id', {
            deserialize: (data) => {
                return {tenant: {id: data}}
            }
        })
        const actual = cm.makeContext(headers)
        expect(actual).toEqual({'a':1,'b':'2','c':true,'d':{'d1':1},tenant: {id:'demo'}})
    })
})
