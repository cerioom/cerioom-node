import 'reflect-metadata'
import { ContextManager, DI, RuntimeError, Security, Str } from '@cerioom/core'
import { ContextScope } from '@cerioom/core/context/context-manager'
import { EventBusService } from '../event-bus.service'


/**
 * Example:
 * <code>@ResourceEventTrigger()</code>
 */
export function ResourceEventTrigger () {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = async function (...args: any[]): Promise<any> {
            const tenantId = DI.get(ContextManager).getContext(ContextScope.REQUEST).get<string>('tenant.id')
            const eventBus = DI.get(EventBusService)
            const format = Reflect.getMetadata('resourceEvent:format', this.constructor)
            const resource = Reflect.getMetadata('resourceEvent:resourceName', this.constructor)
            const action = Reflect.getMetadata('resourceEvent:actionName', target.constructor, propertyKey)
            const maskFields = Reflect.getMetadata('security:maskFields', target.constructor, propertyKey)
            const event = Str.resolveTemplate(format || '', {resource: resource, action: action, tenantId: tenantId})

            try {
                let result = originalMethod.apply(this, args)
                if (result instanceof Promise) {
                    result = await result
                }

                if (event && eventBus && 'publish' in eventBus) {
                    let eventPayload = {data: result}
                    if (maskFields?.length) {
                        eventPayload = {
                            data: Array.isArray(args)
                                ? args.map(el => Security.maskFields(el, maskFields))
                                : Security.maskFields(args, maskFields)
                        }
                    }
                    setImmediate(async () => await eventBus.publish(event, eventPayload))
                } else {
                    // todo logging
                }
                return result
            } catch (err) {
                this.log.error({error: RuntimeError.toLog(err)})
                if (event && eventBus && 'publish' in eventBus) {
                    let eventPayload = {data: args}
                    if (maskFields?.length) {
                        eventPayload = {
                            data: Array.isArray(args)
                                ? args.map(el => Security.maskFields(el, maskFields))
                                : Security.maskFields(args, maskFields)
                        }
                    }

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
