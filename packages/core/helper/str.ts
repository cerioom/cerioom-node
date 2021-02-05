import { BinaryToTextEncoding, createHash } from 'crypto'


const escapeMap = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#x27;',
    '/': '&#x2F;',
    '<': '&lt;',
    '>': '&gt;',
}


// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Str {
    public static readonly NUM = '0123456789'
    public static readonly ALPHA = 'abcdefghijklmnopqrstuvwxyz'
    public static readonly B16 = `${Str.NUM}abcdef`
    public static readonly B36 = `${Str.NUM}${Str.ALPHA}`
    public static readonly B62 = `${Str.NUM}${Str.ALPHA}${Str.ALPHA.toUpperCase()}`
    public static readonly B64 = `${Str.B62}_-`

    public static trim(str) {
        return str.replace(/\s+/g, ' ').trim()
    }

    public static random(length = 10, chars = Str.B62): string {
        const base = [...chars]
        // eslint-disable-next-line no-bitwise
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

    /**
     * ```ts
     * Str.decrement('a_1'); // "a"
     * Str.decrement("a_2"); // "a_1"
     * ```
     */
    public static decrement(text: string, separator = '_'): string {
        const parts = text.split(separator)
        let number = ''
        if (!Number.isNaN(parts[1])) {
            let num = Number(parts[1])
            num--
            if (num <= 0) {
                return parts[0]
            }
            number = String(num)
        }

        return `${parts[0]}${separator}${number}`
    }

    /**
     * ```ts
     * Str.increment('a');   // "a_1"
     * Str.increment("a_1"); // "a_2"
     * ```
     */
    public static increment(text: string, separator = '_'): string {
        const parts = text.split(separator)
        let number = '1'
        if (!Number.isNaN(parts[1])) {
            let num = Number(parts[1])
            number = String(num++)
        }

        return `${parts[0]}${separator}${number}`
    }
}
