import { Security } from './security'


describe('security', () => {
    it('should encrypt and decrypt a text', async () => {
        const text = 'texttexttext'
        const secret = 'qwerty1234567890'

        {
            const encrypted = await Security.encrypt(text, secret)
            const actual = await Security.decrypt(encrypted, secret)
            expect(actual).toEqual(text)
        }

        {
            const encrypted = await Security.encrypt(text, secret, 'salt', {algorithm: 'aes-256-cbc', keyLen: 32, separator: '.'})
            const actual = await Security.decrypt(encrypted, secret, 'salt', {algorithm: 'aes-256-cbc', keyLen: 32, separator: '.'})
            expect(actual).toEqual(text)
        }

        {
            const encrypted = await Security.encrypt(text, secret, 'salt', {algorithm: 'aes-192-cbc', keyLen: 24, separator: '.'})
            const actual = await Security.decrypt(encrypted, secret, 'salt', {algorithm: 'aes-192-cbc', keyLen: 24, separator: '.'})
            expect(actual).toEqual(text)
        }
    })

    it('should hash and verify a password', async () => {
        const password = '123456'
        const salt = 'qwerty'

        {
            const hash = await Security.hashPassword(password)
            expect(await Security.verifyPassword(hash, password)).toBeTruthy()
        }

        {
            const hash = await Security.hashPassword(password, salt)
            expect(await Security.verifyPassword(hash, password, salt)).toBeTruthy()
        }

        {
            const hash = await Security.hashPassword(password, salt, {encoding: 'hex', separator: ':', keyLen: 32})
            expect(await Security.verifyPassword(hash, password, salt, {encoding: 'hex', separator: ':', keyLen: 32})).toBeTruthy()
        }
    })
})
