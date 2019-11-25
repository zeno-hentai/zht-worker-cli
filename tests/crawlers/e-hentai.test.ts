import { EHentaiCrawler } from '../../src/crawlers/e-hentai';
import { expect } from 'chai';
import { createWorkTestConfig } from '../utils';
import { ZHTCrawlerManager } from '../../src/loop/manager';
import { WorkerTestConfig } from '../utils/config';
import { GalleryMeta } from 'zht-client-api';
describe('e-hentai crawler test', () => {
    const crawler = EHentaiCrawler
    const url = 'https://e-hentai.org/g/1522800/cde4635627/'
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
        expect(await crawler.test('https://exhentai.org/g/1522800/cde4635627/')).false
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
            expect(item.meta.title).eq('[Shiheki] Tokushu Seiheki o Oshitsuke te kuru Villain to ippanzin no manga  丨 強迫轉換特殊性癖的敵人和普通人 [Chinese] [沒有漢化]')
            expect(item.meta.language).eq('zh-CN')
            expect(item.tags.some( ({tag}) => tag == 'artist:shiheki')).true
            expect(item.meta.pageNumber).eq(7)
            const fileMap = await testConf.client.getFileMap(item.id, item.key)
            expect(Object.keys(fileMap).length).eq(7)
        }
    }).timeout(100000)
})