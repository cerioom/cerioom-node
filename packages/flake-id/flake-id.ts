import { CharSet, UniqueIdInterface } from '@cerioom/core'
import FlakeIdGen from 'flake-idgen'
import convertBase = require('bigint-base-converter')


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

    public decode(input: string, chars: CharSet = CharSet.B36): Buffer {
        return Buffer.from(convertBase(input, chars, 256))
    }

    public gen(opts?: {chars?: CharSet}): string {
        return this.toString(opts?.chars)
    }

    public async toStringAsync(chars: CharSet = CharSet.B36): Promise<string> {
        return convertBase([].slice.call(this.nextAsync()), 256, chars)
    }

    public toString(chars: CharSet = CharSet.B36): string {
        const buf = this.next()
        return convertBase([].slice.call(buf), 256, chars)
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
