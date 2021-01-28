import { get } from 'lodash'
import { ConfigInterface } from './config.interface'


export class Config implements ConfigInterface {
    constructor(obj: Record<string, any>) {
        Object.keys(Object.assign({}, obj)).forEach((key) => {
            this.set(key, obj[key])
        })
    }

    public set(key: string, value: any): this {
        if (typeof (value) === 'object') {
            value = Object.freeze(value)
        }
        Object.defineProperty(this, key, {
            value,
            writable: false, // to prevent changes
            configurable: true, // to support destroying properties later
        })

        return this
    }

    public get<T extends any>(key, defaultValue?): T {
        return get(this, key, defaultValue)
    }

    public toJSON(): object {
        return Object.getOwnPropertyNames(this)
            .reduce((accum, key) => {
                accum[key] = this[key]

                return accum
            }, {})
    }
}
