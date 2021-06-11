import { DI, RuntimeError, Security, Str } from '@cerioom/core'
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
            const format = Reflect.getMetadata('resourceEvent:format', this.constructor)
            const resource = Reflect.getMetadata('resourceEvent:resourceName', this.constructor)
            const action = Reflect.getMetadata('resourceEvent:actionName', target.constructor, propertyKey)
            const maskFields = Reflect.getMetadata('security:maskFields', target.constructor, propertyKey)
            const event = Str.resolveTemplate(format, {resource: resource, action: action})

            let eventPayload = {data: args}
            if (maskFields?.length) {
                eventPayload = {
                    data: Array.isArray(args)
                        ? args.map(el => Security.maskFields(el, maskFields))
                        : Security.maskFields(args, maskFields)
                }
            }

            try {
                let result = originalMethod.apply(this, args)
                if (result instanceof Promise) {
                    result = await result
                }

                if (eventBus && 'publish' in eventBus) {
                    setImmediate(async () => await eventBus.publish(event, eventPayload))
                } else {
                    // todo logging
                }
                return result
            } catch (err) {
                this.log.error({error: RuntimeError.toLog(err)})
                if (eventBus && 'publish' in eventBus) {
                    // @ts-expect-error
                    setImmediate(async () => await eventBus.publish(event, {data: eventPayload, error: RuntimeError.toJSON(err)}))
                } else {
                    // todo logging
                }
                throw err
            }
        }
    }
}