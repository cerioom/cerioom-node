import { SerializerInterface } from '@cerioom/core'
import { UnsupportedCurrencyError } from './currency.error'
import listOfCurrency = require('world-currencies')


// DO NOT TOUCH!!!
const CAPACITY_MAGNIFIER = 2


export class CurrencySerializer implements SerializerInterface<number> {
    protected currency = 'USD'

    public configure(param: {currency: any}): this {
        this.currency = param.currency
        return this
    }

    public serialize(value: number): number {
        return Math.round(value * 10 ** (CurrencySerializer.getFractionSize(this.currency) + CAPACITY_MAGNIFIER))
    }

    public deserialize(value: number): number {
        return parseInt(String(value / 10 ** CAPACITY_MAGNIFIER), 10) / 10 ** CurrencySerializer.getFractionSize(this.currency)
    }

    public static getFractionSize(currency: string, defaultValue = 2): number {
        const curr = listOfCurrency[currency]
        if (curr) {
            return curr.units.minor.majorValue.toString().split('.')[1].length || defaultValue
        }

        throw new UnsupportedCurrencyError()
    }
}
