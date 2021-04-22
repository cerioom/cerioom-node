import { DI } from '../di'
import { Logger } from './logger'


export function Log(...args: any[]) {
    switch (args.length) {
        case 1:
            return LogClass.apply(this, args)
        case 2:
            return LogProperty.apply(this, args)
        case 3:
            if (typeof args[2] === 'number') {
                return LogParameter.apply(this, args)
            }
            return LogMethod.apply(this, args)
        default:
            throw new Error()
    }
}

function LogClass(target: any) {
    const original = target
    const f: any = function(...args) {
        const instance = DI.get(original)
        // @ts-expect-error
        if (!instance.log) {
            // @ts-expect-error
            instance.log = DI.get(Logger)
                .child({
                    // @ts-expect-error
                    module: instance.constructor.name === 'ioc_wrapper' ? instance.constructor.__parent.name : instance.constructor.name
                })
                .info('constructed')
        }
        return instance
    }

    f.prototype = original.prototype
    return f

    // return target
}

function LogParameter(target: any, key: string, index: number) {
    const metadataKey = `__log_${key}_parameters`
    if (Array.isArray(target[metadataKey])) {
        target[metadataKey].push(index)
    } else {
        target[metadataKey] = [index]
    }
}

function LogMethod(target, key, descriptor) {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, key)
    }
    const originalMethod = descriptor.value

    // editing the descriptor/value parameter
    descriptor.value = function(...args: any[]) {

        let result
        const metadataKey = `__log_${key}_parameters`
        const indices = target[metadataKey]

        if (Array.isArray(indices)) {
            for (let i = 0; i < args.length; i++) {

                if (indices.includes(i)) {

                    const arg = args[i]
                    const argStr = JSON.stringify(arg) || arg.toString()
                    console.log(`${key} arg[${i}]: ${argStr}`)
                }
            }
            result = originalMethod.apply(this, args)
            return result
        } else {
            const bindings = this.log?.bindings() || {}
            this._module = bindings.module
            this._action = originalMethod.name
            this.log = DI.get(Logger).child({
                ...bindings,
                requestId: this.context?.requestId || undefined,
                action: originalMethod.name
            })
            this.log.info()

            return originalMethod.apply(this, args)
        }
    }

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor
}

function LogProperty(target: any, key: string) {

    // property value
    let _val = this[key]

    // property getter
    const getter = function() {
        console.log(`Get: ${key} => ${_val}`)
        return _val
    }

    // property setter
    const setter = function(newVal) {
        console.log(`Set: ${key} => ${newVal}`)
        _val = newVal
    }

    // Delete property.
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (delete this[key]) {
        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        })
    }
}
