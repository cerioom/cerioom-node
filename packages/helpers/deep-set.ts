export class DeepSet<T> extends Set<T> {
    public add(o: T) {
        for (const i of this) {
            if (this.deepCompare(o, i)) {
                return this
            }
        }
        super.add.call(this, o)
        return this
    }

    deepCompare(o: T, i: T) {
        return JSON.stringify(o) === JSON.stringify(i)
    }
}
