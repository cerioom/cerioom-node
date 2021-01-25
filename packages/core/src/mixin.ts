export type Constructor<T> = new(...args: any[]) => T

export function mixin<T1>(MixIns: [Constructor<T1>]): Constructor<T1>;
export function mixin<T1, T2>(MixIns: [Constructor<T1>, Constructor<T2>]): Constructor<T1&T2>;
export function mixin<T1, T2, T3>(MixIns: [Constructor<T1>, Constructor<T2>, Constructor<T3>]): Constructor<T1&T2&T3>;

export function mixin(MixIns: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class Class { }

    for (const MixIn of MixIns) {
        Object.getOwnPropertyNames(MixIn.prototype).forEach(name => {
            Class.prototype[name] = MixIn.prototype[name]
        })
    }

    return Class
}
