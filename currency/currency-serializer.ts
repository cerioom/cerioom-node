import { SerializerInterface } from '../core/serializer'
import { UnsupportedCurrencyError } from './currency.error'
import listOfCurrency = require('world-currencies')


const CAPACITY_MAGNIFIER = 2 // DO NOT CHANGE!!!


export class CurrencySerializer implements SerializerInterface<number> {
    protected currency: string = 'USD'

    public configure(param: {currency: any}): this {
        this.currency = param.currency
        return this
    }

    public serialize(value: number): number {
        return Math.round(value * 10 ** (CurrencySerializer.getFractionSize(this.currency) + CAPACITY_MAGNIFIER))
    }

    public deserialize(value: number): number {
        return parseInt(String(value / 10 ** CAPACITY_MAGNIFIER)) / 10 ** CurrencySerializer.getFractionSize(this.currency)
    }

    public static getFractionSize(currency: string): number {
        if (currency in listOfCurrency) {
            return listOfCurrency[currency].units.minor.majorValue
                .toString()
                .split('.')[1].length || 2
        }

        throw new UnsupportedCurrencyError()
    }
}
