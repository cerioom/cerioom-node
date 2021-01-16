import { createHash, HexBase64Latin1Encoding } from 'crypto'


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Strings {
    static trim(str) {
        return str.replace(/\s+/g, ' ').trim()
    }

    public static randomString(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        const base = [...chars]
        return [...Array(length)].map((_) => base[Math.random() * base.length | 0]).join('')
    }

    public static hash(str: string, encoding: HexBase64Latin1Encoding = 'base64', algorithm: 'sha1' | 'sha256' | 'md5' = 'sha1'): string {
        return createHash(algorithm).update(str).digest(encoding)
    }

    static isDate(date: string): boolean {
        return new Date(date).toString() === 'Invalid Date' && isNaN(Date.parse(date))
    }
}
