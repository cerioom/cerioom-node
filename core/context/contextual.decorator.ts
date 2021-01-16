import { DI } from '../di'
import { ContextManager } from './context-manager'


export function Contextual() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value.context = DI.get(ContextManager).getContext()
    }
}
