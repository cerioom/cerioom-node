import { Container } from '@atriory/common/ioc'
import { ContextManager } from './context-manager'


export function Contextual() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.context = Container.get(ContextManager).getContext()
    }
}
