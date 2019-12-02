import { ZHTCrawler } from '../types/crawlers';
import { EHentaiCrawler } from './e-hentai';
import { TestCrawler } from './test';
const crawlerList: ZHTCrawler<any>[] = [
    EHentaiCrawler,
    TestCrawler
]
export default crawlerList