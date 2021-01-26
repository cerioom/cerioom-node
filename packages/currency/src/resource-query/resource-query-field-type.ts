import { ContextInterface } from '@cerioom/core'
import { DI } from '@cerioom/core'
import { NumberField, ResourceQueryMapperType } from '@cerioom/resource'
import { CurrencySerializer } from '../currency-serializer'


export const CurrencyField: ResourceQueryMapperType<number> = (value: any, name: string, context: ContextInterface) => {
    const currencyManager = DI.get(CurrencySerializer).configure({
        currency: context.tenant?.config?.get('currency.alpha3') || 'USD', // todo parameter name
    })

    return currencyManager.serialize(NumberField(value, name, context))
}
