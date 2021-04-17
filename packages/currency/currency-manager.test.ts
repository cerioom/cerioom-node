import { CurrencyManager } from './currency-manager'


describe('CurrencyManager', () => {
    it('should return CurrencyNumber', () => {
        const cm = new CurrencyManager()
            .setLocales('en-US')
            .setOptions({
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })

        expect(JSON.stringify(cm.getCurrencyNumber(12345678.901))).toEqual('{"value":12345678.901,"locales":"en-US","options":{"style":"currency","currency":"USD","minimumFractionDigits":2,"maximumFractionDigits":2},"numberFormat":{},"currencySign":"$","groupSeparator":",","decimalSeparator":"."}')
    })

    it('should format with template', () => {
        const cm = new CurrencyManager()
            .setLocales('en-US')
            .setNumberFormatTemplate({
                group: '<g>${value}</g>',
                integer: '<i>${value}</i>',
                decimal: '<d>${value}</d>',
                currency: '<c>${value}</c>',
                fraction: '<f>${value}</f>'
            })
            .setOptions({
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })

        expect(cm.formatWithTemplate(12345678.901)).toBe('<c>$</c><i>12</i><g>,</g><i>345</i><g>,</g><i>678</i><d>.</d><f>90</f>')
    })
})
