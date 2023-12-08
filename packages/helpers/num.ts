export class Num {
    public static between(value: number, from: number, to: number): boolean {
        return value >= from && value <= to;
    }

    /**
     * Check if numbers sequence is increasing
     *
     * @param {number[]} numArr - a sequence of input numbers, must be valid floating point values;
     * @return {boolean} - true if given sequence is increasing, false otherwise
     */
    public static isIncreasingSequence(numArr: number[]): boolean {
        for (let num = 0; num < numArr.length - 1; num++) {
            if (
                numArr[num] >= numArr[num + 1]
                || Number.isNaN(numArr[num])
                || Number.isNaN(numArr[num + 1])
            ) {
                return false;
            }
        }

        return true;
    }
}
