export class CurrencyNumber {
    private readonly options: Intl.NumberFormatOptions
    private readonly numberFormat: Intl.NumberFormat
    private groupSeparator: string
    private decimalSeparator: string
    private currencySign: string

    constructor(
        protected value: number,
        protected locales: string | string[],
        options?: Intl.NumberFormatOptions,
    ) {
        this.options = {...options, ...{style: 'currency'}}
        this.numberFormat = new Intl.NumberFormat(this.locales, this.options)
        this.numberFormat
            .formatToParts(12345678.901)
            .forEach(part => {
                switch (part.type) {
                    case 'group':
                        this.groupSeparator = part.value
                        return
                    case 'decimal':
                        this.decimalSeparator = part.value
                        return
                    case 'currency':
                        this.currencySign = part.value
                        return
                }
            })
    }

    public getResolvedOptions(): Intl.ResolvedNumberFormatOptions {
        return this.numberFormat.resolvedOptions()
    }

    public getDecimalSeparator(): string {
        return this.decimalSeparator
    }

    public getCurrencySign(): string {
        return this.currencySign
    }

    public getGroupSeparator(): string {
        return this.groupSeparator
    }

    public format(): string {
        return this.numberFormat.format(this.value)
    }

    public formatToParts(): Intl.NumberFormatPart[] {
        return this.numberFormat.formatToParts(this.value)
    }
}
