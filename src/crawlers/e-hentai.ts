import { ZHTCrawler, CrawlerMetaClient, CrawlerProxyConfig } from '../types/crawlers';
import { GalleryMeta } from 'zht-client-api';
import cheerio from 'cheerio'
import axios from 'axios';

async function initialize(proxy: CrawlerProxyConfig | null): Promise<void>{

}

async function test(url: string): Promise<boolean> {
    return !!url.match(/http?s:\/\/e-hentai\.org\/g\/\d+\/[A-Za-z]+\d+\//)
}

function parseMetaPage(doc: CheerioStatic): [Omit<GalleryMeta, 'pageNumber' | 'files'>, string[], string] {
    const title = doc("#gn").text()
    const jpTitle = doc("#gj").text()
    const description = ""
    const language = 'jp'
    const tags: string[] = []
    return [
        {
            type: "gallery",
            title,
            subTitles: {
                'jp': jpTitle
            },
            description,
            language
        },
        tags,
        ""
    ]
}

function parseImagePage(doc: CheerioStatic): [string, string | null] {
    return ["", null]
}

async function download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<GalleryMeta>): Promise<boolean> {
    const agent = axios.create({
        proxy: proxy || undefined
    });
    const doc = cheerio.load((await agent.get(url)).data)
    const [meta, tags, firstUrl] = parseMetaPage(doc)
    const images: [string, ArrayBuffer][] = []
    let pageUrl: string | null = firstUrl
    while(pageUrl != null){
        const imgDoc = cheerio.load((await agent.get(pageUrl)).data)
        const [imgUrl, nextPage] = parseImagePage(imgDoc)
        const ext = (imgUrl.match(/\.(\w+)$/) || ['jpg'])[1]
        const {data} = (await agent.get(imgUrl))
        images.push([ext, data])
        pageUrl = nextPage
    }
    const files: {[key: string]: string} = {}
    images.forEach(([ext, _], idx) => {
        files[idx] = `${idx}.${ext}`
    })
    const {uploadFile} = await client.uploadMeta({
        ...meta,
        pageNumber: images.length,
        files
    }, tags)
    let index = 0
    for(let [ext, imageData] of images) {
        const name = `${index++}.${ext}`
        await uploadFile(name, imageData)
    }
    return true
}

export const EHentaiCrawler: ZHTCrawler<GalleryMeta> = {
    initialize,
    test,
    download
}