export function ConnectExceptionHandler() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = async function(...args: any[]): Promise<any> {
            try {
                const result = originalMethod.apply(this, args)
                if (result instanceof Promise) {
                    return await result
                }

                return result
            } catch (e) {
                args[2](e) // todo
            }
        }
    }
}
