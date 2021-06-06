export function Log (params: {logLevel: string} = {logLevel: 'info'}): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return function <TFunction extends Function> (target: TFunction): TFunction | void {
        // @ts-expect-error
        const _target = target.name === 'ioc_wrapper' ? target.__parent : target // typescript-ioc hack!!!
        const methods = Object.getOwnPropertyNames(_target.prototype).filter(p => p !== 'constructor')
        for (const methodName of methods) {
            const descriptor = Object.getOwnPropertyDescriptor(_target.prototype, methodName)
            if (!descriptor || !(descriptor.value instanceof Function)) {
                continue
            }

            const originalMethod = descriptor.value
            descriptor.value = function (...args: any[]): any {
                let module = {}
                if (!('module' in this.log.bindings()) && 'getModuleName' in this) {
                    module = {module: this.getModuleName()}
                }
                this.log[params.logLevel]({...module, action: descriptor.value.methodName})

                return originalMethod.apply(this, args)
            }

            descriptor.value.methodName = methodName

            Object.defineProperty(_target.prototype, methodName, descriptor)
        }
    }
}
