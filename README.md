Cerioom
---


### Examples:


**Entity**

```ts
import {Exclude, Expose, plainToClass, Transform} from 'class-transformer'
import {DI, RuntimeError, Util} from '@cerioom/core'
import {FlakeId} from '@cerioom/flake-id'


export interface CreateWorkspaceInterface {
    name: string
    description: string
}

export enum WorkspaceStatusEnum {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
}

export class Workspace {
    public static readonly PREFIX = 'WS'

    @Exclude()
    private readonly _id: string

    @Transform(Util.ifEmpty(_ => `${Workspace.PREFIX}${DI.get(FlakeId).gen()}`))
    public workspaceId: string

    @Expose()
    @Transform(Util.ifEmpty(_ => { throw new RuntimeError() }), {toPlainOnly: true})
    public name: string

    @Expose()
    @Transform(Util.ifEmpty(_ => ''), {toPlainOnly: true})
    public description: string

    @Expose()
    @Transform(Util.ifEmpty(_ => new Date()))
    public created: Date

    @Expose()
    @Transform(Util.ifEmpty(_ => new Date()))
    @Transform(_ => new Date(), {toPlainOnly: true})
    public updated: Date

    @Expose()
    @Transform(Util.ifEmpty(_ => WorkspaceStatusEnum.ACTIVE))
    public status: WorkspaceStatusEnum = WorkspaceStatusEnum.ACTIVE


    constructor (init?: Partial<Workspace>) {
        if (init) {
            Object.assign(this, plainToClass(Workspace, init))
        }
    }
}
```


**Repository**

```ts
import {Repository} from '@cerioom/mongodb'
import {DateField, ResourceQueryMapper, StringField} from '@cerioom/resource'
import {classToPlain, plainToClass} from 'class-transformer'
import {Workspace, WorkspaceStatusEnum} from './workspace'


export class WorkspaceRepository extends Repository<Workspace> {
    constructor () {
        super({
            modelClass: Workspace,
            collectionName: 'workspace',
            serializer: {
                serialize: (workspace: Workspace) => classToPlain<Workspace>(workspace),
                deserialize: (data: any) => plainToClass<Workspace, any>(Workspace, data),
            },
            resourceQueryMapper: new ResourceQueryMapper<Workspace>({
                workspaceId: StringField,
                name: StringField,
                created: DateField,
                updated: DateField,
            }),
        })
    }

    public async findById (workspaceId: string) {
        return await this.findOne({workspaceId: workspaceId})
    }

    public async findByName (name: string) {
        return await this.findOne({name: name})
    }

    public async create (workspace: Workspace): Promise<Workspace> {
        return await this.findOneAndUpdate(
            {workspaceId: workspace.workspaceId},
            {$set: workspace},
            {
                returnDocument: 'after',
                upsert: true
            }
        )
    }

    public async updateOne (workspace: Workspace): Promise<Workspace> {
        return await this.findOneAndUpdate(
            {workspaceId: workspace.workspaceId},
            {$set: workspace},
            {
                returnDocument: 'after',
                upsert: true
            }
        )
    }

    public async deleteById (workspaceId: string): Promise<number> {
        const {deletedCount} = await this.remove({workspaceId: workspaceId})
        return deletedCount
    }

    public async countById (workspaceId: string): Promise<number> {
        return await this.count({workspaceId: workspaceId})
    }

    public async activate (workspaceId: string): Promise<Workspace> {
        return await this.findOneAndUpdate(
            {workspaceId: workspaceId},
            {$set: {status: WorkspaceStatusEnum.ACTIVE}},
            {
                upsert: false,
                returnDocument: 'after'
            }
        )
    }

    public async disable (workspaceId: string): Promise<Workspace> {
        return await this.findOneAndUpdate(
            {workspaceId: workspaceId},
            {$set: {status: WorkspaceStatusEnum.DISABLED}},
            {
                upsert: false,
                returnDocument: 'after'
            }
        )
    }
}
```


**Service**

```ts
import contentDisposition from 'content-disposition'
import {Readable, Writable} from 'stream'
import tar from 'tar-stream'
import zlib from 'zlib'
import {CacheService} from '@cerioom/cache'
import {DI, Env, Service} from '@cerioom/core'
import {EventBusService, ResourceEventTrigger} from '@cerioom/event-bus'
import {BadRequestError, InternalServerError, NotFoundError} from '@cerioom/http'
import {ResourceAction, ResourceName, ResourceQueryInterface} from '@cerioom/resource'
import {MGMT} from '../events'
import {FileStorageService} from '../file-storage/file-storage.service'
import {Policy} from '../policy/policy'
import {CreateWorkspaceInterface, Workspace, WorkspaceStatusEnum} from './workspace'
import {WorkspaceRepository} from './workspace.repository'


const INITIAL_LAST_MODIFIED = new Date('2021-01-01T12:00:00Z')


@ResourceName('workspace')
export class WorkspaceService extends Service {
    private readonly env = DI.get(Env)
    private readonly workspaceRepository = DI.get(WorkspaceRepository)
    private readonly eventBus = DI.get(EventBusService)
    private readonly fileStorageService = DI.get(FileStorageService)
    private readonly cache = DI.get(CacheService).configure({keyPrefix: this.constructor.name})
    private readonly MANIFEST_FILENAME = '.manifest'
    private readonly BUNDLE_FILENAME = 'bundle.tar.gz'


    constructor () {
        super()
        Promise.all([
            this.eventBus.subscribe(MGMT.V1.WORKSPACE.LIST, this.onList.bind(this)),
        ]).catch(console.error.bind(console)) // todo logger
    }

    public async onList ([query]: [ResourceQueryInterface<Workspace>]) {
        this.log.info(query)
        return await this.workspaceRepository.list(query)
    }

    @ResourceAction('create')
    @ResourceEventTrigger()
    public async create (payload: CreateWorkspaceInterface): Promise<Workspace> {
        // todo check workspace exists

        return await this.workspaceRepository.create(new Workspace(payload))
    }

    @ResourceAction('update')
    @ResourceEventTrigger()
    public async updateOne (workspaceId: string, payload: Workspace): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId)
        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        const updatedWorkspace = new Workspace({...workspace, ...payload})

        return await this.workspaceRepository.updateOne(updatedWorkspace)
    }

    public async download (filter: { workspaceIdOrName?: string }, writer: Writable): Promise<Record<string, string>> {
        let workspace: Workspace | null = null

        if (filter.workspaceIdOrName?.startsWith(Workspace.PREFIX)) {
            workspace = await this.workspaceRepository.findById(filter.workspaceIdOrName)
        }

        if (filter.workspaceIdOrName && !workspace) {
            workspace = await this.workspaceRepository.findByName(filter.workspaceIdOrName)
        }

        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        const {
            stream,
            lastModified,
        } = await this.makeBundleTar(workspace)
        stream.pipe(zlib.createGzip()).pipe(writer)

        return {
            ETag: `"${workspace.workspaceId}/${lastModified.toISOString()}"`,
            'Last-Modified': lastModified.toISOString(),
            'Content-Type': 'application/gzip',
            'Content-Disposition': contentDisposition(`${this.BUNDLE_FILENAME}`),
        }
    }

    private async makeBundleTar (workspace: Workspace): Promise<{ stream: Readable, lastModified: Date }> {
        const [[policiesResp]] = await this.eventBus.request(MGMT.V1.POLICY.LIST, {
                filter: {workspaceId: workspace.workspaceId},
                limit: 1000,
        })
        if (policiesResp.data.length === 0) {
            throw new InternalServerError('Workspace is empty')
        }

        let lastModified = INITIAL_LAST_MODIFIED

        const pack = tar.pack()
        for (const policy of policiesResp.data) {
            const parts = policy.name.split('/')
            const regoFilename = `${parts.pop()}.rego`
            const folder = parts.join('/')
            pack.entry({name: `${folder}/${regoFilename}`}, policy.text)
            if (policy.update > lastModified) {
                lastModified = policy.update
            }
        }

        pack.entry(
            {name: this.MANIFEST_FILENAME},
            JSON.stringify(this.makeManifest(workspace, policiesResp.data), null, 2),
        )

        pack.finalize() // finalize tar

        return {
            stream: pack,
            lastModified: lastModified,
        }
    }

    @ResourceAction('activate')
    @ResourceEventTrigger()
    public async activate (workspaceId: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId)
        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.status === WorkspaceStatusEnum.ACTIVE) {
            throw new BadRequestError('Declined. The workspace is active')
        }

        return await this.workspaceRepository.activate(workspaceId)
    }

    @ResourceAction('disable')
    @ResourceEventTrigger()
    public async disable (workspaceId: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(workspaceId)
        if (!workspace) {
            throw new NotFoundError('Workspace not found')
        }

        if (workspace.status === WorkspaceStatusEnum.DISABLED) {
            throw new BadRequestError('Declined. The workspace is disabled')
        }

        return await this.workspaceRepository.disable(workspaceId)
    }
}
```


**Controller**

```ts
import {DI, Service, Time, Log} from '@cerioom/core'
import {ConnectExceptionHandler} from '@cerioom/http'
import {CacheService} from '@cerioom/cache'
import {TemplateService} from './template.service'


@Log()
export class TemplateController extends Service {
    private readonly templateService = DI.get(TemplateService)
    private readonly cache = DI.get(CacheService).configure({keyPrefix: this.constructor.name})

    @ConnectExceptionHandler()
    public async list (req, res, next) {
        res.json(
            await this.cache.cached(
                'list',
                async () => await this.templateService.list(),
                Time.SECOND(10).asSeconds()
            )
        )
    }
}
```
