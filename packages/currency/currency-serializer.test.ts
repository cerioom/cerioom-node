import { CurrencySerializer } from './currency-serializer'
import { UnsupportedCurrencyError } from './currency.error'


describe('CurrencySerializer', () => {
    it('should get fraction size', () => {
        const cm = new CurrencySerializer()
        expect(cm.configure({currency: 'USD'}).getFractionSize()).toBe(2)
        expect(cm.configure({currency: 'BHD'}).getFractionSize()).toBe(3)
        expect(() => cm.configure({currency: 'unknown'}).getFractionSize()).toThrow(UnsupportedCurrencyError)
    })

    it('should serialize', () => {
        const cm = new CurrencySerializer()

        cm.configure({currency: 'USD'})
        expect(cm.serialize(1.234567)).toBe(12346)
        expect(cm.serialize(0.67777)).toBe(6778)
        expect(cm.serialize(100 * 0.67777)).toBe(677770)
        expect(cm.serialize(1 / 0.67777)).toBe(14754)

        cm.configure({currency: 'BHD'})
        expect(cm.serialize(1.23)).toBe(123000)
        expect(cm.serialize(1.223499)).toBe(122350)
    })

    it('should deserialize', () => {
        const cm = new CurrencySerializer()

        cm.configure({currency: 'USD'})
        expect(cm.deserialize(12346)).toBe(1.23)
        expect(cm.deserialize(6778)).toBe(0.67)
        expect(cm.deserialize(677770)).toBe(67.77)
        expect(cm.deserialize(14754)).toBe(1.47)

        cm.configure({currency: 'BHD'})
        expect(cm.deserialize(123000)).toBe(1.23)
        expect(cm.deserialize(122350)).toBe(1.223)
    })
})
