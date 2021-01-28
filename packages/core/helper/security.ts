import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import * as _ from 'lodash'


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

    public static encrypt(
        text: string,
        key: string,
        encoding: BufferEncoding = 'base64',
        algorithm = 'aes-256-cbc',
        ivLength = 16,
        separator: string = '.'
    ): string {
        const passwordHash = createHash('md5').update(key, 'utf8').digest('hex').toUpperCase()
        const iv = randomBytes(ivLength)
        const cipher = createCipheriv(algorithm, passwordHash, Buffer.from(iv))
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return iv.toString(encoding) + separator + encrypted.toString(encoding)
    }

    public static decrypt(
        text: string,
        key: string,
        encoding: BufferEncoding = 'base64',
        algorithm = 'aes-256-cbc',
        separator: string = '.'
    ): string | undefined {
        try {
            const passwordHash = createHash('md5').update(key, 'utf8').digest('hex').toUpperCase()
            const [iv, str] = text.split(separator)
            const encryptedText = Buffer.from(str, encoding)
            const decipher = createDecipheriv(algorithm, passwordHash, Buffer.from(iv, encoding))
            let decrypted = decipher.update(encryptedText)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            return decrypted.toString()
        } catch (e) {
            return undefined
        }
    }
}
