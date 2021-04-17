import { RuntimeError, SerializerInterface } from '@cerioom/core'
import { UnsupportedCurrencyError } from './currency.error'


// DO NOT TOUCH!!!
const CAPACITY_MAGNIFIER = 2


export class CurrencySerializer implements SerializerInterface<number> {
    protected currency = 'USD'
    protected locales: string | string[] = 'en-US'

    public configure(param: {currency?: any,  locales?: string | string[]}): this {
        this.currency = param.currency || 'USD'
        this.locales = param.locales || 'en-US'
        return this
    }

    public serialize(value: number): number {
        return Math.round(value * 10 ** (this.getFractionSize() + CAPACITY_MAGNIFIER))
    }

    public deserialize(value: number): number {
        return parseInt(String(value / 10 ** CAPACITY_MAGNIFIER), 10) / 10 ** this.getFractionSize()
    }

    public getFractionSize(): number {
        try {
            return new Intl.NumberFormat(this.locales, {style: 'currency', currency: this.currency})
                .resolvedOptions()
                .minimumFractionDigits
        } catch (e) {
            const err = new UnsupportedCurrencyError()
            err.setCause(new RuntimeError(e.message)).setData({currency: this.currency})
            throw err
        }
    }
}
