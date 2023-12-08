import { Num } from './num'


describe('num', () => {
    it('should identify number in between two', () => {
        expect(Num.between(2, 1, 3)).toBeTruthy()
        expect(Num.between(2, 3, 5)).toBeFalsy()
    })
    it('should identify sequence numbers', () => {
        expect(Num.isIncreasingSequence([1,2,3,4])).toBeTruthy()
        expect(Num.isIncreasingSequence([1, 2, 3, 2])).toBeFalsy()
    })
})
