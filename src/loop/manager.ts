import { RuntimeConfig } from '../data/config';
import { createWebSocketFromConfig } from './es';
import { pollTask } from './crawler';
import { ZHTWebSocketClient } from 'zht-client-api';
export class ZHTCrawlerManager {
    private ws: ZHTWebSocketClient
    private config: RuntimeConfig
    private flow: Promise<void>
    constructor(config: RuntimeConfig){
        this.config = config
        this.flow = Promise.resolve()
        this.ws = createWebSocketFromConfig(config.config.server)
        this.ws.onMessage(() => {
            this.poll()
        })
        this.ws.send(config.config.server.apiToken)
        this.poll()
    }

    private poll() {
        this.flow = this.flow.then(async () => {
            const proxy = this.config.config.server.useProxy ? {
                host: this.config.config.server.proxyHost,
                port: this.config.config.server.proxyPort
            } : null
            await pollTask(proxy, this.config.client, this.config.config, this.config.keyPair.privateKey)
        })
    }

    async close(){
        this.ws.close()
        await this.flow
    }
}