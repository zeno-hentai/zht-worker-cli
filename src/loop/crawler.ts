import crawlerList from '../crawlers';
import { ZHTCrawler, CrawlerProxyConfig, CrawlerMetaClient, CrawlerStatus } from '../types/crawlers';
import { ZHTWorkerClientAPI } from "zht-client-api";
import { ZHTBaseMeta } from 'zht-client-api';
import { ConfigFileData } from '../data/config';

export async function getMatchedCrawler(url: string): Promise<ZHTCrawler<ZHTBaseMeta<any>> | null>{
    const matched = await Promise.all(crawlerList.map(async crawler => (await crawler.test(url)) ? crawler : null))
    return matched.find( t => !!t ) || null
}

export async function initializeCrawlers(proxy: CrawlerProxyConfig | null): Promise<void> {
    for(let crawler of crawlerList){
        await crawler.initialize(proxy)
    }
}

export async function executeCrawler(
    url: string,
    proxy: CrawlerProxyConfig | null,
    crawler: ZHTCrawler<ZHTBaseMeta<any>>, 
    workerClient: ZHTWorkerClientAPI,
    config: ConfigFileData
    ): Promise<boolean> {
        const client: CrawlerMetaClient<ZHTBaseMeta<any>> = {
            uploadMeta: async (meta: ZHTBaseMeta<any>, tags: string[]) => {
                const {id, key} = await workerClient.createItem({
                    meta, tags
                }, config.worker.userPublicKey)
                return {
                    uploadFile: async (name: string, data: ArrayBuffer) => {
                        await workerClient.uploadItemFile(id, name, key, data, (p) => console.log(`Uploading: ${p}`))
                    }
                }
            }
        }
        try{
            return await crawler.download(url, proxy, client)
        }catch(err) {
            console.error(err)
            return false
        }
}

export async function pollTask(
    proxy: CrawlerProxyConfig | null,
    workerClient: ZHTWorkerClientAPI,
    config: ConfigFileData,
    workerPrivateKey: string
): Promise<CrawlerStatus> {
    const polledTask = await workerClient.pollTask(workerPrivateKey)
    if(polledTask.hasTask){
        const {id, url} = polledTask.data
        const crawler = await getMatchedCrawler(url)
        if(crawler){
            console.log(`Task started: ${url}`)
            const success = await executeCrawler(
                url,
                proxy,
                crawler,
                workerClient,
                config
            )
            if(success){
                await workerClient.taskSuccess(id)
                console.log(`Task succeed: ${url}`)
                return 'SUCCESS'
            }else{
                await workerClient.taskFailed(id)
                console.log(`Task failed: ${url}`)
                return 'FAILED'
            }
        }else{
            console.log(`Failed to find crawler for task [${id}]: ${url}`)
            await workerClient.taskFailed(id)
            return 'NOT_MATCHED'
        }
    }else{
        return 'EMPTY'
    }
}