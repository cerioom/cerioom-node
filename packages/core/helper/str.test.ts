import { Str } from './str'


describe('str', () => {
    it('should increment', () => {
        expect(Str.increment('v', '_')).toBe('v_1')
        expect(Str.increment('v_1')).toBe('v_2')
    })

    it('should decrement', () => {
        expect(Str.decrement('v_1', '_')).toBe('v')
        expect(Str.decrement('v_2')).toBe('v_1')
    })

    it('should resolve template', () => {
        const template = 'Hello ${val}!'
        const data = {val: 'world'}
        expect(Str.resolveTemplate(template, data)).toBe('Hello world!')
    })
})
