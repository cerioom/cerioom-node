import _ from 'lodash'
import 'reflect-metadata'


const REQ = 0
const RES = 1
const NEXT = 2


export function ConnectControllerMethod (): MethodDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return <T>(target: Object, methodName: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void => {
        const originalMethod = descriptor.value

        // @ts-expect-error
        descriptor.value = async function (...args: any[]): any {
            try {
                const data = <any[]> Reflect.getMetadata('connectController:param', target, methodName) || []
                const newArgs = data
                    .sort((a, b) => a.argIndex > b.argIndex ? 1 : -1)
                    .map(conf => {
                        switch (conf.type) {
                            case 'headers':
                            case 'params':
                            case 'query':
                            case 'body':
                                return conf.name ? _.get(args[REQ][conf.type], conf.name) : args[REQ][conf.type]
                            case 'request': return args[REQ]
                            case 'response': return args[RES]
                            case 'next': return args[NEXT]
                            default: return null
                        }
                    })
                    .filter(Boolean)

                // @ts-expect-error
                const result = originalMethod.apply(this, newArgs.length ? newArgs : args)
                if (result instanceof Promise) {
                    return await result
                }

                return result
            } catch (e) {
                args[2](e) // todo
            }
        }

        // @ts-expect-error
        descriptor.value.methodName = methodName
    }
}

export function Headers (name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'headers', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Params (name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'params', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Query (name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'query', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Body (name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'body', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Request () {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({
            type: 'request',
            argIndex: parameterIndex,
        })

        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Response () {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({
            type: 'response',
            argIndex: parameterIndex,
        })

        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Next () {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({
            type: 'next',
            argIndex: parameterIndex,
        })

        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}
