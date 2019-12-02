import { ZHTCrawler, CrawlerMetaClient, CrawlerProxyConfig } from "../types";
import { GalleryMeta } from "zht-client-api";
import fs from 'fs'
import {testImageResources} from '../../tests/utils/resources'

async function download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<GalleryMeta>): Promise<boolean> {
    const files = testImageResources()
    const fileMap: {[key: number]: string} = {}
    files.map(({name}, idx) => fileMap[idx] = name)
    const meta = await client.uploadMeta({
        title: '测试',
        type: 'gallery',
        pageNumber: files.length,
        files: fileMap,
        source: {type: 'crawler', url},
        subTitles: {},
        language: 'zh-Hans',
        description: '测试'
    }, ['测试'])
    for(let {name, path} of files){
        const data = await fs.promises.readFile(path)
        await meta.uploadFile(name, data)
    }
    return true
}

export const TestCrawler: ZHTCrawler<GalleryMeta> = {
    initialize: async () => {},
    test: async (url) => url === 'test://',
    download
}