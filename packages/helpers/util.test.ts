import { Util } from './util'

describe('util', () => {
    describe('parseVersion', () => {
        it('should parse version', () => {
            const actual = Util.parseVersion('2.4.3-rc.0')
            expect(actual).toEqual({
                version: '2.4.3-rc.0',
                number: 2004003,
                major: 2,
                minor: 4,
                patch: 3,
                suffix: 'rc.0'
            })
        })
        it('should throw exception for incorrect version', () => {
            expect(() => Util.parseVersion('2.4')).toThrowError('Unsupported version format "2.4"')
        })
    })

    describe('chunk', () => {
        it('should make chunks', () => {
            const actual = Util.chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3)
            expect(actual).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]])
        })
    })

    it ('should sleep 100ms', async () => {
        const start = Date.now()
        await Util.sleep(100)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(100)
    })

    describe('attempt', () => {
        it ('should make 2 attempts', async () => {
            let counter = 0
            const actual = await Util.attempt(() => {
                if (counter++ < 2) {
                    throw new Error('error')
                }
                return 'success'
            }, {maxAttempts: 3})
            expect(actual).toEqual('success')
        })
        it ('should fail after first attempt', async () => {
            let counter = 0
            try {
                await Util.attempt(() => {
                    if (counter++ < 2) {
                        throw new Error('error')
                    }
                    return 'success'
                }, {maxAttempts: 1})
            } catch (e) {
                expect(e.message).toEqual('error')
            }
        })
    })

    describe('toBoolean', () => {
        it ('should convert to boolean', () => {
            expect(Util.toBoolean('on')).toEqual(true)
            expect(Util.toBoolean('TRUE')).toEqual(true)
            expect(Util.toBoolean(true)).toEqual(true)
            expect(Util.toBoolean(1)).toEqual(true)
            expect(Util.toBoolean('yes')).toEqual(true)
            expect(Util.toBoolean('+')).toEqual(true)
            expect(Util.toBoolean('off')).toEqual(false)
            expect(Util.toBoolean('FALSE')).toEqual(false)
            expect(Util.toBoolean(false)).toEqual(false)
            expect(Util.toBoolean(0)).toEqual(false)
            expect(Util.toBoolean('no')).toEqual(false)
            expect(Util.toBoolean('null')).toEqual(false)
            expect(Util.toBoolean('-')).toEqual(false)
        })
    })

    it ('should check ifEmpty', () => {
        const fn = () => {return 123}
        const ifEmpty = Util.ifEmpty(fn)
        expect(ifEmpty).toBeInstanceOf(Function)
        expect(ifEmpty('1')).toBe('1')
        expect(ifEmpty(undefined)).toBe(123)
        expect(ifEmpty(null)).toBe(123)
        expect(ifEmpty('')).toBe(123)
    })

    it ('should cast values', () => {
        expect(Util.castValue(1)).toBe(1)
        expect(Util.castValue('1.1')).toBe(1.1)
        expect(Util.castValue('true')).toBe(true)
        expect(Util.castValue('false')).toBe(false)
        expect(Util.castValue('null')).toBe(null)
        expect(Util.castValue(null)).toBe(null)
        expect(Util.castValue('undefined')).toBe(undefined)
        expect(Util.castValue(undefined)).toBe(undefined)
        expect(Util.castValue('{"a":1}')).toEqual({a: 1})
        expect(Util.castValue('["a", 1]')).toEqual(['a', 1])
    })

    it ('should extract values', () => {
        const obj = {
            a: 1,
            b: {
                c: 2
            }
        }
        expect(Util.subset(obj, ['b'])).toEqual({a: 1})
        expect(Util.subset(obj, ['b.c'])).toEqual(obj)
    })
})
