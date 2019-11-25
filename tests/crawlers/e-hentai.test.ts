import { EHentaiCrawler } from '../../src/crawlers/e-hentai';
import { expect } from 'chai';
describe('e-hentai crawler test', async () => {
    const crawler = EHentaiCrawler
    const url = 'https://e-hentai.org/g/1522800/cde4635627/'

    it('test', async () => {
        expect(await crawler.test(url)).true
        expect(await crawler.test('https://exhentai.org/g/1522800/cde4635627/')).false
    })


})