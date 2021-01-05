export function Log() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // descriptor.value.log = Container.get(ContextManager).getContext().log.child({action: descriptor.value.name})
        const originalMethod = descriptor.value
        descriptor.value = async function(...args: any[]): Promise<any> {
            const log = this.log
            this.log = log.child({action: originalMethod.name})
            const result = originalMethod.apply(this, args)
            if (result instanceof Promise) {
                return await result
            }

            return result
        }
    }
}
