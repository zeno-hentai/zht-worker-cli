import { ZHTBaseMeta } from '../../../zht-client-api/dist/lib/meta/base';
export interface ZHTCrawler<Meta extends ZHTBaseMeta<any>> {
    initialize(proxy: CrawlerProxyConfig | null): Promise<void>
    test(url: string): Promise<boolean>
    download(url: string, proxy: CrawlerProxyConfig | null, client: CrawlerMetaClient<Meta>): Promise<boolean>
}

export interface CrawlerMetaClient<Meta> {
    uploadMeta(meta: Meta, tags: string[]): Promise<CrawlerFileClient>
}

export interface CrawlerFileClient {
    uploadFile(name: string, data: ArrayBuffer): Promise<void>
}

export interface CrawlerProxyConfig {
    host: string
    port: number
}