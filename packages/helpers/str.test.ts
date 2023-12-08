import { Str } from './str'


describe('str', () => {
    it('should get distinct values from an array', () => {
        expect(Str.distinct(['a', 'b', 'a'])).toEqual(['a', 'b'])
        expect(Str.distinct([1, 2, 3, 2])).toEqual([1, 2, 3])
    })

    it('should increment', () => {
        expect(Str.increment('v', '_')).toBe('v_1')
        expect(Str.increment('v_1')).toBe('v_2')
    })

    it('should decrement', () => {
        expect(Str.decrement('v_1', '_')).toBe('v')
        expect(Str.decrement('v_2')).toBe('v_1')
    })

    it('should resolve template', () => {
        // @ts-ignore
        expect(Str.resolveTemplate(null, {})).toBe(null)
        // @ts-ignore
        expect(Str.resolveTemplate(10, {})).toBe(10)
        expect(Str.resolveTemplate('text', {})).toBe('text')

        {
            const template = 'Hello ${val}!'
            const data = {val: 'world'}
            expect(Str.resolveTemplate(template, data)).toBe('Hello world!')
        }
        {
            const template = 'Hello [[val]]!'
            const data = {val: 'world'}
            expect(Str.resolveTemplate(template, data, ['\\[\\[', '\\]\\]'])).toBe('Hello world!')
        }
    })

    it('should pad string right', () => {
        expect(Str.pad('a', 5)).toBe('a    ')
        expect(Str.pad('abc', 5, 'x')).toBe('abcxx')
        expect(Str.pad('abcdef', 5, 'x')).toBe('abcdef')
    })

    it('should pad string left', () => {
        expect(Str.pad(5, 'ab')).toBe('   ab')
        expect(Str.pad(5, 'a', 'x')).toBe('xxxxa')
        expect(Str.padLeft('a', 5, 'x')).toBe('xxxxa')
    })

    it('should sanitize codename', () => {
        expect(Str.sanitizeCodename('-1@as.c-f_fgZ.')).toBe('1as.c-f_fgZ')
    })
})
