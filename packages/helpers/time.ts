export class TimeDef {
    constructor(
        private ms: number,
    ) {
    }

    public asMillis() {
        return this.ms
    }

    public asSeconds() {
        return this.ms / 1000
    }

    public asMinutes() {
        return this.asSeconds() / 60
    }

    public asHours() {
        return this.asMinutes() / 60
    }

    public asDays() {
        return this.asHours() / 24
    }

    public asWeeks() {
        return this.asDays() / 7
    }
}

export class Time {
    public static MILLIS = (count: number) => new TimeDef(count)
    public static SECOND = (count: number) => new TimeDef(count * 1_000)
    public static MINUTE = (count: number) => new TimeDef(count * 60_000)
    public static HOUR = (count: number) => new TimeDef(count * 3_600_000)
    public static DAY = (count: number) => new TimeDef(count * 86_400_000)
    public static WEEK = (count: number) => new TimeDef(count * 604_800_000)
}
