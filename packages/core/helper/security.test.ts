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
            expect(await Security.verifyPassword(hash, password)).toBe(true)
        }

        {
            const hash = await Security.hashPassword(password, salt)
            expect(await Security.verifyPassword(hash, password, salt)).toBe(true)
        }

        {
            const hash = await Security.hashPassword(password, salt, {encoding: 'hex', separator: ':', keyLen: 32})
            expect(await Security.verifyPassword(hash, password, salt, {encoding: 'hex', separator: ':', keyLen: 32})).toBe(true)
        }
    })

    it('shamir split and combine', () => {
        const secret = 'qwerty1234567890'

        {
            const shares = Security.shamirSplit(Buffer.from(secret), {shares: 3, threshold: 2})
            expect(Security.shamirCombine([shares[1], shares[0]]).toString()).toEqual(secret)
            expect(Security.shamirCombine([shares[0], shares[1]]).toString()).toEqual(secret)
            expect(Security.shamirCombine([shares[1], shares[2]]).toString()).toEqual(secret)
            expect(Security.shamirCombine([shares[0], shares[2]]).toString()).toEqual(secret)
        }

        {
            const shares = Security.shamirSplit(Buffer.from(secret), {shares: 4, threshold: 2})
            const sharesStrings = shares.map(x => x.toString('base64'))
            // const sharesStrings = [
            //     'CAGmB8B3j1zlrS7XdUNk6TLsUoEpjX/FlnPvBR38qvoDlAtcZmXeWfD8z+opDEuomaM=',
            //     'CAJRDp3uA7jXR1yz6obIz2TGpE9STP7fMb/DUDq6SbUGYBbuzJmhOf15g19St5bUL8g=',
            //     'CAP3CV2ZjOQy6nJkn8WsJlYr9v57+IEip/ssYydz43sFxx2Aqs1/GQ3xTMd73t0Ltho=',
            //     'CASiHCfBBm2zjrh7yRGNg8iSVc6k0+HrYjqb+nQ2kisMlSyXhXxf+eduGyik3DEsXh4=',
            // ]

            expect(
                Security.shamirCombine([
                    Buffer.from(sharesStrings[0], 'base64'),
                    Buffer.from(sharesStrings[1], 'base64'),
                ]).toString()
            ).toBe(secret)
        }
    })
})
