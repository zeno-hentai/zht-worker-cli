import { ZHTCrawler, CrawlerMetaClient, CrawlerProxyConfig } from '../types/crawlers';
import { GalleryMeta } from 'zht-client-api';
import cheerio from 'cheerio'
import axios from 'axios';

async function initialize(proxy: CrawlerProxyConfig | null): Promise<void>{

}

async function test(url: string): Promise<boolean> {
    return !!url.match(/http?s:\/\/e-hentai\.org\/g\/\d+\/[A-Za-z]+\d+\//)
}

async function download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<GalleryMeta>): Promise<boolean> {
    const agent = axios.create({
        proxy: proxy || undefined
    });
    const doc = cheerio.load((await agent.get(url)).data)
    doc(".")
}

export const EHentaiCrawler: ZHTCrawler<GalleryMeta> = {
    initialize,
    test,
    download
}