import { CurrencyNumber } from './currency-number'


export class CurrencyManager {
    protected regexTemplateValue = new RegExp('\\$\\{.*?\\}')
    protected numberFormatTemplate = {group: '${value}', integer: '${value}', decimal: '${value}', currency: '${value}', fraction: '${value}'}
    protected locales: string | string[]
    protected currency: string
    protected options: Intl.NumberFormatOptions

    public setNumberFormatTemplate(template: any): this {
        this.numberFormatTemplate = template
        return this
    }

    public getNumberFormatTemplate(): any {
        return this.numberFormatTemplate
    }

    public setLocales(locales: string | string[]) {
        this.locales = locales
        return this
    }

    public setCurrency(currency: string): this {
        this.currency = currency
        return this
    }

    public getCurrency() {
        return this.currency
    }

    public setOptions(options: Intl.NumberFormatOptions): this {
        this.options = options
        if (!this.currency && options.currency) {
            this.currency = options.currency
        }
        return this
    }

    public getOptions(): Intl.NumberFormatOptions {
        return this.options
    }

    public getCurrencyNumber(value: number, locales?: string | string[], options?: Intl.NumberFormatOptions): CurrencyNumber {
        return new CurrencyNumber(value, locales || this.locales, options || this.options)
    }

    public formatWithTemplate(value: number, locales?: string | string[], options?: Intl.NumberFormatOptions): string {
        const currencyNumber = this.getCurrencyNumber(value, locales || this.locales, options || this.options)

        let result = ''
        for(const part of currencyNumber.formatToParts()) {
            const template = this.numberFormatTemplate[part.type]
            if (template) {
                result += template.replace(this.regexTemplateValue, part.value)
            } else {
                result += part.value
            }
        }

        return result
    }
}
