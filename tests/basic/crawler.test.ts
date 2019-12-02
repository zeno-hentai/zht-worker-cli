import { expect } from 'chai';
import { createWorkTestConfig } from '../utils';
import { ZHTCrawlerManager } from '../../src/loop/manager';
import { WorkerTestConfig } from '../utils/config';
import { GalleryMeta } from 'zht-client-api';
import { TestCrawler } from '../../src/crawlers/test';
describe('test crawler test', () => {
    const crawler = TestCrawler
    const url = 'test://'
    let manager: ZHTCrawlerManager | null
    let testConf: WorkerTestConfig | null
    
    before(async () => {
        testConf = await createWorkTestConfig()
        manager = new ZHTCrawlerManager(testConf.config)
        await manager.initialize()
    })

    after(async () => {
        if(manager){
            await manager.close()
        }
        if(testConf){
            await testConf.close()
        }
    })

    it('test', async () => {
        expect(await crawler.test(url)).true
    })

    it('download', async () => {
        expect(testConf && manager).not.undefined
        if(testConf && manager) {
            const pollManager = manager
            const onFinish = new Promise((resolve, reject) => {
                let called = false
                pollManager.onPoll((success) => {
                    if(!called){
                        resolve(success)
                    }
                    called = true
                })
            })
            await testConf.client.addWorkerTask(
                url, 
                testConf.config.config.worker.userPublicKey,
                testConf.workerId,
                testConf.config.keyPair.publicKey
            )
            expect(await onFinish).true
            const tasks = await testConf.client.queryWorkerTasks(testConf.userPrivateKey)
            expect(tasks.length).eq(1)
            expect(tasks[0].status).eq('SUCCESS')
            const items = await testConf.client.queryItemList(
                0, 1, testConf.userPrivateKey, a => a as GalleryMeta
            )
            expect(items.length).eq(1)
            const item = items[0]
            expect(item.meta.title).eq('测试')
            expect(item.meta.language).eq('zh-Hans')
            expect(item.tags.some( ({tag}) => tag == '测试')).true
            expect(item.meta.pageNumber).eq(3)
            const fileMap = await testConf.client.getFileMap(item.id, item.key)
            const names = Object.keys(fileMap)
            expect(names.length).eq(3)
        }
    }).timeout(100000)
})