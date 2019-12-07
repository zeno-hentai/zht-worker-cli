import { ZHTCrawler, CrawlerMetaClient, CrawlerProxyConfig } from "../types";
import { GalleryMeta } from "zht-client-api";
import fs from 'fs'
import {testImageResources} from '../../tests/utils/resources'
import sharp from "sharp";

async function download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<GalleryMeta>): Promise<boolean> {
    const files = testImageResources()
    const fileMap: {[key: number]: string} = {}
    files.map(({name}, idx) => fileMap[idx] = name.replace(/\.jpg/, '.png'))
    const meta = await client.uploadMeta({
        title: '测试',
        type: 'gallery',
        pageNumber: files.length,
        files: fileMap,
        source: {type: 'crawler', url},
        subTitles: {},
        preview: '0.png',
        language: 'zh-Hans',
        description: '测试'
    }, ['测试'])
    for(let {name, path} of files){
        console.log(path)
        const data = await fs.promises.readFile(path)
        const img = await sharp(data).png().toBuffer()
        await meta.uploadFile(name.replace(/\.jpg/, '.png'), img.buffer)
    }
    return true
}

export const TestCrawler: ZHTCrawler<GalleryMeta> = {
    initialize: async () => {},
    test: async (url) => url === 'test://',
    download
}