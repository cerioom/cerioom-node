import { Application, DI, RuntimeError } from '@cerioom/core'
import { EventBusService } from '../event-bus.service'
import 'reflect-metadata'


export function ResourceEventTrigger (version = '', delimiter = '.') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = async function (...args: any[]): Promise<any> {
            const app = DI.get(Application)
            const eventBus = DI.get(EventBusService)
            const resource = Reflect.getMetadata(`${app.name}:resourceName`, this.constructor)
            const action = Reflect.getMetadata(`${app.name}:actionName`, target.constructor, propertyKey)
            const event = [app.name, version, resource, action].filter(Boolean).join(delimiter)

            try {
                let result = originalMethod.apply(this, args)
                if (result instanceof Promise) {
                    result = await result
                }

                if (eventBus && 'publish' in eventBus) {
                    // @ts-expect-error
                    setImmediate(async () => await eventBus.publish(event, {data: args}))
                } else {
                    // todo logging
                }
                return result
            } catch (err) {
                this.log.error({error: RuntimeError.toLog(err)})
                if (eventBus && 'publish' in eventBus) {
                    // @ts-expect-error
                    setImmediate(async () => await eventBus.publish(event, {data: args, error: RuntimeError.toJSON(err)}))
                } else {
                    // todo logging
                }
            }
        }
    }
}
