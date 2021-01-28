// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DI {
    public static init(get: <T>(source: Function & { prototype: T } | string | symbol) => T) {
        Object.defineProperty(DI, 'get', {
            value: get,
            writable: false, // to prevent changes
            configurable: true, // to support destroying properties later
        })
    }

    public static get<T>(source: Function & { prototype: T } | string | symbol): T {
        throw new Error('Not implemented')
    }
}
