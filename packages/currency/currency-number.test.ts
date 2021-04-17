import { CurrencyNumber } from './currency-number'


describe('CurrencyNumber', () => {
    it('should be formatted', () => {
        {
            const currencyNumber = new CurrencyNumber(12345678.901, 'en-US', {currency: 'USD'})
            expect(currencyNumber.getCurrencySign()).toBe('$')
            expect(currencyNumber.getGroupSeparator()).toBe(',')
            expect(currencyNumber.getDecimalSeparator()).toBe('.')
            expect(currencyNumber.format()).toBe('$12,345,678.90')
            expect(currencyNumber.formatToParts()).toEqual([{'type':'currency','value':'$'},{'type':'integer','value':'12'},{'type':'group','value':','},{'type':'integer','value':'345'},{'type':'group','value':','},{'type':'integer','value':'678'},{'type':'decimal','value':'.'},{'type':'fraction','value':'90'}])
            expect(currencyNumber.getResolvedOptions()).toEqual({'locale':'en-US','numberingSystem':'latn','style':'currency','currency':'USD','currencyDisplay':'symbol','currencySign':'standard','minimumIntegerDigits':1,'minimumFractionDigits':2,'maximumFractionDigits':2,'useGrouping':true,'notation':'standard','signDisplay':'auto'})
        }

        {
            const currencyNumber = new CurrencyNumber(12345678.901, 'ru-RU', {currency: 'RUB'})
            expect(currencyNumber.getCurrencySign()).toBe('₽')
            expect(currencyNumber.getGroupSeparator()).toBe(' ')
            expect(currencyNumber.getDecimalSeparator()).toBe(',')
            expect(currencyNumber.format()).toBe('12 345 678,90 ₽')
        }

        {
            const currencyNumber = new CurrencyNumber(12345678.901, 'he-IL', {currency: 'ILS'})
            expect(currencyNumber.getCurrencySign()).toBe('₪')
            expect(currencyNumber.getGroupSeparator()).toBe(',')
            expect(currencyNumber.getDecimalSeparator()).toBe('.')
            expect(currencyNumber.format()).toBe('‏12,345,678.90 ₪')
        }

        {
            const currencyNumber = new CurrencyNumber(12345678.901, 'ar-SA', {currency: 'SAR'})
            expect(currencyNumber.getCurrencySign()).toBe('ر.س.')
            expect(currencyNumber.getGroupSeparator()).toBe('٬')
            expect(currencyNumber.getDecimalSeparator()).toBe('٫')
            expect(currencyNumber.format()).toBe('١٢٬٣٤٥٬٦٧٨٫٩٠ ر.س.‏')
        }

        {
            const currencyNumber = new CurrencyNumber(12345678.901, 'bn-BD', {currency: 'BDT'})
            expect(currencyNumber.getCurrencySign()).toBe('৳')
            expect(currencyNumber.getGroupSeparator()).toBe(',')
            expect(currencyNumber.getDecimalSeparator()).toBe('.')
            expect(currencyNumber.format()).toBe('১,২৩,৪৫,৬৭৮.৯০৳')
        }
    })
})
