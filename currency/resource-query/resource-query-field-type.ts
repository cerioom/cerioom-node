import { ContextInterface } from '../../core/context'
import { DI } from '../../core/di'
import { NumberField, ResourceQueryMapperType } from '../../resource/resource-query'
import { CurrencySerializer } from '../currency-serializer'


export const CurrencyField: ResourceQueryMapperType<number> = (value: any, name: string, context: ContextInterface) => {
    const currencyManager = DI.get(CurrencySerializer).configure({
        currency: context.tenant?.config?.get('currency.alpha3') || 'USD', // todo parameter name
    })

    return currencyManager.serialize(NumberField(value, name, context))
}
