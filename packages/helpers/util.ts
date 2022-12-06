const SEMVER_REGEX = /^(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)(?:-(?<suffix>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/


export interface ParsedVersionInterface {
    version: string
    number: number
    major: number
    minor: number
    patch: number
    suffix: string
}

type AnyFunction = (...args: any[]) => any

export class Util {

    public static async sleep(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * @link https://github.com/icodeforlove/npm_atmpt
     */
    public static async attempt<T>(
        func: AnyFunction,
        config: { maxAttempts?: number; delay?: AnyFunction | number } = {}
    ): Promise<T> {
        const delay = config.delay || 0
        const maxAttempts = config.maxAttempts || 1

        return await (async (): Promise<any> => {
            let attempts = 0

            do {
                try {
                    return func(attempts)
                } catch (error) {
                    if (attempts >= maxAttempts) {
                        throw error
                    }

                    await Util.sleep(typeof delay === 'number' ? delay : delay(attempts))
                }
            } while (++attempts)
        })()
    }

    public static chunk(array: any[], chunkSize: number): any[][] {
        const arr = [...array]
        return new Array(Math.ceil(arr.length / chunkSize))
            .fill(0)
            .map(_ => arr.splice(0, chunkSize))
    }

    public static toBoolean(val: string | number | boolean | null): boolean {
        const list: {[key: string]: boolean | undefined} = {
            '+': true,
            on: true,
            true: true,
            1: true,
            yes: true,
            '-': false,
            off: false,
            false: false,
            0: false,
            no: false,
            null: false,
        }
        return list[String(val).toLowerCase()] ?? false
    }

    public static parseVersion(version: string): ParsedVersionInterface {
        const m = version.match(SEMVER_REGEX)
        if (!m || !m.groups) {
            throw new Error(`Unsupported version format "${version}"`)
        }

        const [major, minor, patch] = [m.groups.major, m.groups.minor, m.groups.patch].map(Number)
        const number = major * 1_000_000 + minor * 1_000 + patch

        return {version: version, number: number, major: major, minor: minor, patch: patch, suffix: m.groups.suffix}
    }

    public static ifEmpty(fn) {
        return (...args: any[]) => {
            if (args[0] === undefined || args[0] === null || args[0] === '') {
                return fn(...args)
            }

            return args[0]
        }
    }

    public static castValue(value: any) {
        const bool = ['false', 'true']
        const json = '{['

        const num = Number(value)
        if (value === null) {
            // skip transformation
        } else if (!Number.isNaN(num)) {
            value = num
        } else if (bool.indexOf(value) > -1) {
            value = value === 'true'
        } else if (value === 'null') {
            value = null
        } else if (value === 'undefined' || value === undefined) {
            value = undefined
        } else if (typeof value === 'string' && json.indexOf(value.trim()[0]) > -1) {
            try {
                value = JSON.parse(value)
            } catch (e) {
            }
        }

        return value
    }

    /**
     * This function is used to extract the value from the object by the key. It does not support nested keys.
     * If you need to use nested keys, use the `lodash.get` function.
     */
    public static subset(obj: object, extract: string[]): object {
        return Object.fromEntries(Object.entries(obj).filter(([key]) => !extract.includes(key)))
    }
}
