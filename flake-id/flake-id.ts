import * as FlakeIdGen from 'flake-idgen'
import convertBase = require('bigint-base-converter')


export enum BaseEnum {
    BASE10 = '0123456789',
    BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    BASE64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-',
}


export class FlakeId {
    protected generator: FlakeIdGen

    constructor(opts?: {
        datacenter?: number
        worker?: number
        id?: number
        epoch?: number
        seqMask?: number
    }) {
        this.generator = new FlakeIdGen(opts ?? {epoch: 1577836800000})
    }

    public static decode(input: string, base: BaseEnum = BaseEnum.BASE36): Buffer {
        return Buffer.from(convertBase(input, base, 256))
    }

    public toStringSync(base: BaseEnum = BaseEnum.BASE36): string {
        return convertBase([].slice.call(this.nextSync()), 256, base)
    }

    public async toString(base: BaseEnum = BaseEnum.BASE36): Promise<string> {
        const buf = await this.next()
        return convertBase([].slice.call(buf), 256, base)
    }

    protected async next(): Promise<Buffer> {
        return await new Promise((resolve, reject) => {
            this.generator.next((err, id) => {
                if (err) {
                    return reject(err)
                }
                resolve(id)
            })
        })
    }

    protected nextSync(): Buffer {
        return this.generator.next()
    }
}
