export class Num {
    public static between(value: number, from: number, to: number): boolean {
        return value >= from && value <= to;
    }
}
