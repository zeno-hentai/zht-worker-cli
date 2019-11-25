import { ZHTCrawler, CrawlerMetaClient, CrawlerProxyConfig } from '../types/crawlers';
import { GalleryMeta } from 'zht-client-api';
import cheerio from 'cheerio'
import axios from 'axios';
import { ZHTLanguage } from '../../../zht-client-api/lib/meta/base';

async function initialize(proxy: CrawlerProxyConfig | null): Promise<void>{

}

async function test(url: string): Promise<boolean> {
    return !!url.match(/http?s:\/\/e-hentai\.org\/g\/\d+\/[A-Za-z]+\d+\//)
}

type OriginalTags = {[key: string]: string[]}

function parsePageTags(doc: CheerioStatic): OriginalTags {
    const tags: OriginalTags = {}
    doc('#taglist tr').each((idx, ele) => {
        const q = cheerio.load(ele)
        const name = q('.tc').text()
        const values: string[] = []
        q('.gt').each((i, n) => values.push(q(n).text()))
        tags[name.slice(0, name.length-1)] = values
    })
    return tags
}

const LanguageMap: {[key: string]: ZHTLanguage} = {
    chinese: 'zh-CN',
    japanese: 'jp',
    english: 'en-US'
}

function getLanguage(tags: OriginalTags): ZHTLanguage {
    if(!tags['language']){
        return 'unknown'
    }else{
        const lang = tags['language'].filter(t => t.match(/Chinese|Japanese|English/i))
        if(lang.length == 0){
            return 'jp'
        }else{
            return LanguageMap[lang[0].toLowerCase()] || 'unknown'
        }
    }
}

function parseMetaPage(doc: CheerioStatic): [Omit<GalleryMeta, 'pageNumber' | 'files'>, string[], string] {
    const title = doc("#gn").text()
    const jpTitle = doc("#gj").text()
    const description = ""
    const originalTags = parsePageTags(doc)
    const language = getLanguage(originalTags)
    const tags: string[] = []
    for(let [name, values] of Object.entries(originalTags)){
        for(let v of values){
            tags.push(`${name}:${v}`)
        }
    }
    const firstUrl = doc('.gdtm > div > a').attr('href')
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
        firstUrl
    ]
}

function parseImagePage(doc: CheerioStatic): [string, string | null] {
    const url = doc('#img').attr('src')
    const nextNode = doc('a#next')
    const nextUrl = nextNode.attr('href')
    return [url, nextUrl]
}

async function download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<GalleryMeta>): Promise<boolean> {
    const agent = axios.create({
        proxy: proxy || undefined
    });
    const doc = cheerio.load((await agent.get(url)).data)
    const [meta, tags, firstUrl] = parseMetaPage(doc)
    const images: [string, ArrayBuffer][] = []
    let pageUrl: string | null = firstUrl
    console.log(meta)
    while(pageUrl != null){
        const imgDoc = cheerio.load((await agent.get(pageUrl)).data)
        const [imgUrl, nextPage] = parseImagePage(imgDoc)
        const ext = (imgUrl.match(/\.(\w+)$/) || ['jpg'])[1]
        console.log(`Image from: ${pageUrl}`)
        const {data} = (await agent.get(imgUrl))
        images.push([ext, data])
        pageUrl = nextPage == pageUrl ? null : nextPage
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