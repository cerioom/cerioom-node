// import { Pipeline } from './mw'
//
//
// describe('Middleware', () => {
//     it('run', async () => {
//         const pipeline = Pipeline()
//         pipeline.use((req: any, res, next) => {
//             req.count++
//             next()
//         })
//         pipeline.use((req: any, res, next) => {
//             req.count++
//             next()
//         })
//         pipeline.use((req: any, res, next) => {
//             expect(req.count).toBe(2)
//             next()
//         })
//
//         expect.assertions(1)
//         await pipeline.run({count: 0}, {})
//     })
// })
