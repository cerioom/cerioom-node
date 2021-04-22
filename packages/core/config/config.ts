import * as _ from 'lodash'
import { inspect } from 'util'
import { ConfigInterface } from './config.interface'


export class Config implements ConfigInterface {
    constructor(obj: Record<string, any>) {
        Object.keys(obj).forEach((key) => {
            this.set(key, obj[key])
        })
    }

    public set(key: string, value: any): this {
        if (!_.has(this, key)) {
            _.set(this, key, Object.freeze(value))
            this.deepFreeze(this)
        }

        return this
    }

    public get<T extends any>(key, defaultValue?): T {
        return _.result(this, key, defaultValue)
    }

    public toJSON(): any {
        return Object.getOwnPropertyNames(this)
            .reduce((accum, key) => {
                accum[key] = this[key]

                return accum
            }, {})
    }

    public toString() {
        return inspect(this)
    }

    private deepFreeze(o) {
        Object.getOwnPropertyNames(o).forEach((prop) => {
            if (o.hasOwnProperty(prop)) {
                if (o[prop] !== null && (typeof o[prop] === 'object' || typeof o[prop] === 'function') && !Object.isFrozen(o[prop])) {
                    this.deepFreeze(o[prop])
                }
                Object.defineProperty(o, prop, {
                    value: o[prop],
                    writable: false, // to prevent changes
                    configurable: true, // to support destroying properties later
                })
            }
        })

        return o
    }
}
