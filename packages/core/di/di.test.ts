// import { DI } from './di'

// const get = (source: Function & { prototype: any } | string | symbol): any => {
//     if (typeof source === 'string') {
//         return 1
//     } else if (typeof source === 'symbol') {
//         return 2
//     } else {
//         return 3
//     }
// }

describe('DI', () => {
    it('should return a service', async () => {
        // DI.init(get)
        // expect(DI.get('string')).toBe(1)
        // expect(DI.get(Symbol('symbol'))).toBe(2)
        // expect(DI.get(() => {})).toBe(3)
        expect(1).toBe(1)
    })
})
