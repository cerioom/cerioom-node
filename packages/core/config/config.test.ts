import { Config } from './config'


describe('Config', () => {
    it('should immutable set a value by key or path', () => {
        const EXPECTED = '{"a":1,"b":{"bb":2},"c":3,"d":{"dd":{"ddd":4}}}'

        const config = new Config({a: 1, b: {bb: 2}})

        config.set('c', 3).set('d.dd', {ddd: 4})
        expect(JSON.stringify(config)).toBe(EXPECTED)

        config.set('c', 4)
        expect(JSON.stringify(config)).toBe(EXPECTED)

        config.set('d.dd.ddd', 5)
        expect(JSON.stringify(config)).toBe(EXPECTED)

        config.set('d.dd', {ddd: 6})
        expect(JSON.stringify(config)).toBe(EXPECTED)
    })

    it('should return a value by key or path', () => {
        const config = new Config({a: 1, b: {bb: 2}})
        expect(config.get('a')).toBe(1)
        expect(config.get('b.bb')).toBe(2)
        expect(config.get('b')).toEqual({bb: 2})
    })

    it('should return as a json', () => {
        const EXPECTED = {a: 1, b: {bb: 2}}
        const config = new Config(EXPECTED)
        const actual = config.toJSON()

        expect(actual).toEqual(EXPECTED)
        expect(actual).not.toBeInstanceOf(Config)
        expect(JSON.stringify(config)).toBe('{"a":1,"b":{"bb":2}}') // JSON.stringify uses toJSON
    })

    it('should return as a string', () => {
        const config = new Config({a: 1, b: {bb: 2}})
        expect(config.toString()).toBe('Config { a: 1, b: { bb: 2 } }')
    })
})
