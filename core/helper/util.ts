// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Util {

    public static async sleep(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * @link https://github.com/icodeforlove/npm_atmpt
     */
    public static async attempt(func: Function, config: any = {}): Promise<any> {
        const delay = config.delay || 30
        const maxAttempts = config.maxAttempts || 2

        return await (async(): Promise<any> => {
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

    public static toBoolean(val: string | number | null): boolean {
        const list: {[key: string]: boolean | undefined} = {
            on: true,
            true: true,
            1: true,
            yes: true,
            off: false,
            false: false,
            0: false,
            no: false,
            null: false
        }
        return list[String(val).toLowerCase()] ?? false
    }
}
