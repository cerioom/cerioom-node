export interface PhoneNumberInterface {
    format: (phoneNumber: string, phoneRegion?: string, phoneNumberFormat?: string | number) => string
}
