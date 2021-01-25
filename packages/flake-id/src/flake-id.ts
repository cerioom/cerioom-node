import { UniqueIdInterface } from '@cerioom/core'
import * as FlakeIdGen from 'flake-idgen'
import convertBase = require('bigint-base-converter')


export enum BaseEnum {
    BASE10 = '0123456789',
    BASE16 = '0123456789abcdef',
    BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    BASE64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-',
}


export class FlakeId implements UniqueIdInterface {
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

    public decode(input: string, base: BaseEnum = BaseEnum.BASE36): Buffer {
        return Buffer.from(convertBase(input, base, 256))
    }

    public gen(opts?: {base?: BaseEnum}): string {
        return this.toString(opts?.base)
    }

    public async toStringAsync(base: BaseEnum = BaseEnum.BASE36): Promise<string> {
        return convertBase([].slice.call(this.nextAsync()), 256, base)
    }

    public toString(base: BaseEnum = BaseEnum.BASE36): string {
        const buf = this.next()
        return convertBase([].slice.call(buf), 256, base)
    }

    protected next(): Buffer {
        return this.generator.next()
    }

    protected async nextAsync(): Promise<Buffer> {
        return await new Promise((resolve, reject) => {
            this.generator.next((err, id) => {
                if (err) {
                    return reject(err)
                }
                resolve(id)
            })
        })
    }
}
