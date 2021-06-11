import { BinaryToTextEncoding, createCipheriv, createDecipheriv, randomBytes, scrypt, timingSafeEqual } from 'crypto'
import * as _ from 'lodash'
import { promisify } from 'util'
import { RuntimeError } from '../error'


const scryptAsync = promisify(scrypt)

const defaultCryptOpts = {
    algorithm: 'aes-256-cbc',
    encoding: 'base64',
    separator: '.',
    keyLen: 32,
}

const defaultHashPassOpts = {
    encoding: 'base64',
    separator: '.',
    keyLen: 32,
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Security {
    public static maskFields(input: object, paths: string[], fn: Function = value => '*****'): any {
        let redacted: object | null = null

        paths.forEach((path) => {
            if (_.has(input, path)) {
                if (!redacted) {
                    redacted = _.cloneDeep(input)
                }

                _.set(<any> redacted, path, fn())
            }
        })

        return redacted ?? input
    }

    public static async encrypt(
        text: string,
        secret: string,
        salt = '',
        options?: {
            algorithm?: string,
            encoding?: BufferEncoding,
            separator?: string,
            keyLen?: number
        },
    ): Promise<string> {
        try {
            const opts = Object.assign({}, defaultCryptOpts, options)
            const key = (await scryptAsync(secret, salt, opts.keyLen)) as Buffer
            const iv = randomBytes(16)
            const cipher = createCipheriv(opts.algorithm, key, Buffer.from(iv))
            let encrypted = cipher.update(text)
            encrypted = Buffer.concat([encrypted, cipher.final()])
            return iv.toString(opts.encoding) + opts.separator + encrypted.toString(opts.encoding)
        } catch (e) {
            throw new RuntimeError(e.message).setCause(e)
        }
    }

    public static async decrypt(
        encrypted: string,
        secret: string,
        salt = '',
        options?: {
            algorithm?: string,
            encoding?: BufferEncoding,
            separator?: string,
            keyLen?: number
        },
    ): Promise<string> {
        try {
            const opts = Object.assign({}, defaultCryptOpts, options)
            const key = (await scryptAsync(secret, salt, opts.keyLen)) as Buffer
            const [iv, str] = encrypted.split(opts.separator)
            const encryptedText = Buffer.from(str, opts.encoding)
            const decipher = createDecipheriv(opts.algorithm, key, Buffer.from(iv, opts.encoding))
            let decrypted = decipher.update(encryptedText)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            return decrypted.toString()
        } catch (e) {
            throw new RuntimeError(e.message).setCause(e)
        }
    }

    public static async hashPassword(
        password: string,
        salt = '',
        options?: {
            encoding?: BinaryToTextEncoding,
            separator?: string,
            keyLen?: number,
        },
    ): Promise<string> {
        try {
            const opts = Object.assign({}, defaultHashPassOpts, options)
            const randomSalt = randomBytes(16).toString(opts.encoding);
            const key = (await scryptAsync(password, randomSalt + salt, opts.keyLen)) as Buffer
            return randomSalt + opts.separator + key.toString(opts.encoding)
        } catch (e) {
            throw new RuntimeError(e.message).setCause(e)
        }
    }

    public static async verifyPassword(
        hash: string,
        password: string,
        salt = '',
        options?: {
            encoding?: BinaryToTextEncoding,
            separator?: string,
            keyLen?: number,
        },
    ): Promise<boolean> {
        try {
            const opts = Object.assign({}, defaultHashPassOpts, options)
            const [randomSalt, key] = hash.split(opts.separator)
            const derivedKey = (await scryptAsync(password, randomSalt + salt, opts.keyLen)) as Buffer
            return timingSafeEqual(Buffer.from(key, opts.encoding), derivedKey)
        } catch (e) {
            throw new RuntimeError(e.message).setCause(e)
        }
    }
}
