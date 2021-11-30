import { CharSet } from '@cerioom/helpers'
import { FlakeId } from './flake-id'


describe('FlakeId', () => {

    it('should generate new ID', () => {
        const flakeId = new FlakeId({
            datacenter: 0,
            worker: 0,
            epoch: 1577836800000,
            seqMask: 0,
            id: 0,
        })

        jest.spyOn(FlakeId.prototype as any, 'next').mockReturnValueOnce(Buffer.from('AgZOurRAAAA=', 'base64'))

        const id = flakeId.gen({chars: CharSet.B36})
        expect(id).toBe('13whwh72ze2o')
    })
})
