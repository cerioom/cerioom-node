import { PhoneInterface } from './phone.interface'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import { PhoneNumberInvalidError } from './phone.error'

export { PhoneNumberFormat } from 'google-libphonenumber'

const phoneUtil = PhoneNumberUtil.getInstance()


export class Phone implements PhoneInterface {
    protected phoneRegion: string | undefined
    protected phoneNumberFormat: string | number | undefined

    constructor(opts?: {phoneRegion?: string, phoneNumberFormat?: string | number}) {
        this.phoneRegion = opts?.phoneRegion
        this.phoneNumberFormat = opts?.phoneNumberFormat
    }

    format(
        phoneNumber: string,
        phoneRegion?: string,
        phoneNumberFormat: PhoneNumberFormat = PhoneNumberFormat.E164,
    ): string {
        try {
            const phone = phoneUtil.parse(phoneNumber, phoneRegion ?? this.phoneRegion)
            if (phoneUtil.isValidNumber(phone)) {
                return phoneUtil.format(phone, phoneNumberFormat ?? this.phoneNumberFormat)
            }
        } catch (err) {
            throw new PhoneNumberInvalidError().setData({phoneNumber: phoneNumber}).setCause(err)
        }

        throw new PhoneNumberInvalidError().setData({phoneNumber: phoneNumber})
    }
}
