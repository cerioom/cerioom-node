// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Random {

    public static numberBetween(start: number, end: number): number {
        return Math.floor(Math.random() * (end - start + 1)) + start
    }

    public static element(arr: any[]): number {
        return arr[Math.floor(Math.random() * arr.length)]
    }

}
