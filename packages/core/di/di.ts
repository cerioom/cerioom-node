// eslint-disable-next-line @typescript-eslint/no-extraneous-class
import { Class } from '../types'


export class DI {

    /**
     * ```ts
     * DI.init(<T>(source: Function & { prototype: T } | string | symbol): T => {
     *     return Container.getValue(source)
     * })
     * ```
     */
    public static init(get: <T extends unknown>(source: Function & {prototype: T} | string | symbol) => T) {
        // @ts-ignore
        Object.defineProperty(global.__cerioom.DI, 'get', {
            value: get,
            writable: false, // to prevent changes
            configurable: true, // to support destroying properties later
        })
    }

    /**
     * ```ts
     * const cache = DI.get(CacheService)
     * ```
     */
    public static get<T extends unknown>(source: Class | Function & {prototype: T} | string | symbol): T {
        // @ts-ignore
        if (!global.__cerioom?.DI?.get) {
            // @ts-ignore
            if (source?.prototype) {
                // @ts-ignore
                return new source()
            } else if (typeof source === 'function') {
                // @ts-ignore
                return new source()
            } else {
                throw new Error('Not implemented "DI.get"')
            }
        }

        // @ts-ignore
        return global.__cerioom.DI.get(source)
    }
}


// @ts-ignore
global.__cerioom = Object.assign({}, global.__cerioom, {DI: {}})
