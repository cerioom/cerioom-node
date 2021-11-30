export declare interface ObjectType<T> {
    new: () => T
}

export declare type Class<T = any> = (new (...args: any[]) => T)

export type Instance<T extends Object = Object> = T
