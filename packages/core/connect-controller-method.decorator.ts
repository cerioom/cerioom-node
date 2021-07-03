import _ from 'lodash'
import 'reflect-metadata'


const REQ = 0
const RES = 1
const NEXT = 2


export function ConnectControllerMethod(): MethodDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return <T>(target: Object, methodName: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void => {
        const originalMethod = descriptor.value

        // @ts-expect-error
        descriptor.value = async function(...args: any[]): any {
            try {
                const data = <any[]> Reflect.getMetadata('connectController:param', target, methodName) || []
                const newArgs = data
                    .sort((a, b) => a.argIndex > b.argIndex ? 1 : -1)
                    .map(conf => {
                        switch (conf.type) {
                            case 'session':
                            case 'headers':
                            case 'params':
                            case 'query':
                            case 'body':
                            case 'ip':
                            case 'hosts':
                            case 'protocol':
                            case 'route':
                                return conf.name ? _.get(args[REQ][conf.type], conf.name) : args[REQ][conf.type]
                            case 'request':
                                return args[REQ]
                            case 'response':
                                return args[RES]
                            case 'next':
                                return args[NEXT]
                            default:
                                return null
                        }
                    })

                // @ts-expect-error
                let result = originalMethod.apply(this, newArgs.length ? newArgs : args)
                if (result instanceof Promise) {
                    result = await result
                }

                return 'send' in args[RES] ? args[RES].send(result) : result
            } catch (err) {
                return typeof args[NEXT] === 'function' ? args[NEXT](err) : args[NEXT]
            }
        }

        // @ts-expect-error
        descriptor.value.methodName = methodName
    }
}

export function Headers(name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'headers', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Param(name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'params', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Query(name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'query', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Body(name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'body', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Request() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'request', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Response() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'response', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Next() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'next', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Session() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'session', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Ip() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'ip', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function HostParam(name?: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'hosts', argIndex: parameterIndex, name: name})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Protocol() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'protocol', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}

export function Route() {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        const data = Reflect.getMetadata('connectController:param', target, propertyKey) || []
        data.push({type: 'route', argIndex: parameterIndex})
        Reflect.defineMetadata('connectController:param', data, target, propertyKey)
    }
}
