export interface ConfigInterface {
    set: (key: string, value: object | string | number | bigint | boolean | symbol | null) => this
    get: <T extends any>(key, defaultValue?) => T
}
