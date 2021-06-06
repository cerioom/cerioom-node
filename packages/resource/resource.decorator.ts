import { Application, ContextManager, DI, RuntimeError } from '@cerioom/core'
import 'reflect-metadata'


export function ResourceName (resourceName: string): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return function <TFunction extends Function> (target: TFunction): TFunction | void {
        const app = DI.get(Application)
        Reflect.defineMetadata(`${app.name}:resourceName`, resourceName, target)
    }
}

export function ResourceAction (actionName: string): MethodDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return function <T> (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
        const app = DI.get(Application)
        Reflect.defineMetadata(`${app.name}:actionName`, actionName, target.constructor, propertyKey)
    }
}

export function ResourcePermission (): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return function <TFunction extends Function> (target: TFunction): TFunction | void {
        const app = DI.get(Application)
        const RESOURCE_NAME = `${app.name}:resourceName`
        if (!Reflect.getMetadata(RESOURCE_NAME, target)) {
            return
        }

        const ACTION_NAME = `${app.name}:actionName`

        // @ts-expect-error
        const _target = target.name === 'ioc_wrapper' ? target.__parent : target // typescript-ioc hack!!!
        const methods = Object.getOwnPropertyNames(_target.prototype).filter(p => {
            return p !== 'constructor' && !!Reflect.getMetadata(ACTION_NAME, target, p)
        })
        for (const methodName of methods) {
            const descriptor = Object.getOwnPropertyDescriptor(_target.prototype, methodName)
            if (!descriptor || !(descriptor.value instanceof Function)) {
                continue
            }

            const originalMethod = descriptor.value
            descriptor.value = function (...args: any[]): any {
                const context = DI.get(ContextManager).getContext()
                const input = {
                    userId: context.get<string>('userId'),
                    roles: context.get<string[]>('roles'),
                    resource: <string>Reflect.getMetadata(RESOURCE_NAME, target),
                    action: <string>Reflect.getMetadata(ACTION_NAME, target, descriptor.value.methodName)
                }
                if (!isAllowed(input)) {
                    throw new RuntimeError(`Forbidden the operation "${input.action}" for the resource "${input.resource}"`)
                        .setData({...input, roles: input.roles.join(',')})
                }

                return originalMethod.apply(this, args)
            }

            descriptor.value.methodName = methodName

            Object.defineProperty(_target.prototype, methodName, descriptor)
        }
    }
}

function isAllowed (input: { resource: string, roles: string[], action: string, userId: string }) {
    return true // todo
}
