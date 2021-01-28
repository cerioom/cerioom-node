import { BinaryToTextEncoding, createHash } from "crypto";


const escapeMap = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#x27;',
    '/': '&#x2F;',
    '<': '&lt;',
    '>': '&gt;',
}


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Strings {
    public static trim(str) {
        return str.replace(/\s+/g, ' ').trim()
    }

    public static randomString(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        const base = [...chars]
        return [...Array(length)].map((_) => base[Math.random() * base.length | 0]).join('')
    }

    public static hash(str: string, encoding: BinaryToTextEncoding = 'base64', algorithm: 'sha1' | 'sha256' | 'md5' = 'sha1'): string {
        return createHash(algorithm).update(str).digest(encoding)
    }

    public static isDate(date: string): boolean {
        return new Date(date).toString() === 'Invalid Date' && isNaN(Date.parse(date))
    }

    public static escape(str: string): string {
        return str.replace(/[&<>"'/]/g, match => escapeMap[match as '&' | '<' | '>' | '"' | '\'' | '/'])
    }
}
