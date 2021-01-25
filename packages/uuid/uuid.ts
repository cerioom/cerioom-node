import * as uuid from 'uuid'
import { RuntimeError } from '../core/error'
import { UniqueIdInterface } from '../core/unique-id.interface'


export class UUID implements UniqueIdInterface {
    protected defaultVersion: '1' | '4'

    constructor(opts?: {defaultVersion?: '1' | '4'}) {
        this.defaultVersion = opts?.defaultVersion ?? '1'
    }

    public gen(opts?: {version?: '1' | '4'}): string {
        const ver = opts?.version ?? this.defaultVersion
        if (ver === '1') {
            return uuid.v1()
        } else if (ver === '4') {
            return uuid.v4()
        }

        throw new RuntimeError('Unknown version of UUI')
    }
}
