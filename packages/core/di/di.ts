// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DI {
    public static init(get: <T extends unknown>(source: Function & {prototype: T} | string | symbol) => T) {
        // @ts-ignore
        Object.defineProperty(global.__cerioom.DI, 'get', {
            value: get,
            writable: false, // to prevent changes
            configurable: true, // to support destroying properties later
        })
    }

    public static get<T extends unknown>(source: Function & {prototype: T} | string | symbol): T {
        // @ts-ignore
        if (!global.__cerioom?.DI?.get) {
            throw new Error('Not implemented')
        }

        // @ts-ignore
        return global.__cerioom.DI.get(source)
    }
}
