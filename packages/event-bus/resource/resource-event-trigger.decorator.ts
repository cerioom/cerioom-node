import { DI, RuntimeError, Str } from '@cerioom/core'
import { EventBusService } from '../event-bus.service'
import 'reflect-metadata'


/**
 * Example:
 * <code>@ResourceEventTrigger()</code>
 */
export function ResourceEventTrigger () {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = async function (...args: any[]): Promise<any> {
            const eventBus = DI.get(EventBusService)
            try {
                let result = originalMethod.apply(this, args)
                if (result instanceof Promise) {
                    result = await result
                }

                if (eventBus && 'publish' in eventBus) {
                    const format = Reflect.getMetadata('resourceEvent:format', this.constructor)
                    const resource = Reflect.getMetadata('resourceEvent:resourceName', this.constructor)
                    const action = Reflect.getMetadata('resourceEvent:actionName', target.constructor, propertyKey)
                    const event = Str.resolveTemplate(format, {resource: resource, action: action})
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
                throw err
            }
        }
    }
}
