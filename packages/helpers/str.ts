import { BinaryToTextEncoding, createHash } from 'crypto'
import * as _ from 'lodash'


const escapeMap = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#x27;',
    '/': '&#x2F;',
    '<': '&lt;',
    '>': '&gt;',
}

export enum CharSet {
    ALNUM = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    DIGIT = '0123456789',
    LOWER = 'abcdefghijklmnopqrstuvwxyz',
    PUNCT =  '!"\\#$%&\'()*+,\\-./:;<=>?@\\[\\]^_‘{|}~',
    SPACE =  ' \\t\\r\\n\\v\\f',
    UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    WORD = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_',
    XDIGIT = '0123456789abcdefABCDEF',
    B16 = '0123456789abcdef',
    B16_UPPER = '0123456789ABCDEF',
    B36 = '0123456789abcdefghijklmnopqrstuvwxyz',
    B38 = '0123456789abcdefghijklmnopqrstuvwxyz-_',
    B36_UPPER = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    B38_UPPER = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_',
    B64 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_',
}

const resolveTemplatePhCache = new WeakMap()
const resolveTemplateReplacer = (vars) => (a, key) => String(_.get(vars, key))

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Str {

    public static trim(str) {
        return str.replace(/\s+/g, ' ').trim()
    }

    public static distinct(array: any[]): any[] {
        return [...new Set(array)]
    }

    public static random(length = 10, chars: CharSet | string = CharSet.ALNUM): string {
        const base = [...chars]
        // eslint-disable-next-line no-bitwise
        return [...Array(length)].map(() => base[Math.random() * base.length | 0]).join('')
    }

    public static hash(str: string, encoding: BinaryToTextEncoding = 'base64', algorithm: 'sha1' | 'sha256' | 'md5' = 'sha1'): string {
        return createHash(algorithm).update(str).digest(encoding)
    }

    public static md5(text: string) {
        return Str.hash(text, 'hex', 'md5')
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
        if (parts[1] && !Number.isNaN(parts[1])) {
            number = String(Number(parts[1]) + 1)
        }

        return `${parts[0]}${separator}${number}`
    }

    public static resolveTemplate(template: string, vars: object, ph: [string, string] = ['\\${', '}']): string {
        if (!template || typeof template !== 'string') {
            return template
        }

        if (!resolveTemplatePhCache.has(ph)) {
            resolveTemplatePhCache.set(ph, new RegExp(`${ph[0]}(.*?)${ph[1]}`, 'gim'))
        }

        return template.replace(resolveTemplatePhCache.get(ph), resolveTemplateReplacer(vars))
    }

    /**
     * Alias
     */
    public static padLeft(text: string, length: number, char = ' ') {
        return Str.pad(length, text, char)
    }

    public static pad(text: string | number, length: number | string, char = ' ') {
        const invert = typeof text === 'number'
        if(invert){
            [length, text] = [text, length]
        }

        if(!(typeof text === 'string')){
            text = text.toString()
        }

        length = length as number - text.length
        if (length < 0) {
            length = 0
        }

        const pad = char.repeat(length)

        return invert
            ? pad + text
            : text + pad
    }
}
