import { RuntimeConfig } from '../data/config';
import { createWebSocketFromConfig } from './es';
import { pollTask } from './crawler';
import { ZHTWorkerNotificationListener } from '../../../zht-client-api/dist/lib/data/worker';
export class ZHTCrawlerManager {
    private listener?: ZHTWorkerNotificationListener
    private config: RuntimeConfig
    private flow: Promise<void>
    private pollHandlers: ((success: boolean) => void)[]
    constructor(config: RuntimeConfig){
        this.config = config
        this.flow = Promise.resolve()
        this.pollHandlers = []
    }

    async initialize() {
        this.listener = await this.config.client.connectWorker({
            userPublicKey: this.config.config.worker.userPublicKey,
            workerPublicKey: this.config.keyPair.publicKey,
            onNotification: () => {
                this.poll()
            }
        })
        this.poll()
    }

    private poll() {
        this.flow = this.flow.then(async () => {
            const proxy = this.config.config.server.useProxy ? {
                host: this.config.config.server.proxyHost,
                port: this.config.config.server.proxyPort
            } : null
            const status = await pollTask(proxy, this.config.client, this.config.config, this.config.keyPair.privateKey)
            if(status == 'SUCCESS' || status == 'FAILED'){
                const success = status == 'SUCCESS'
                for(let h of this.pollHandlers){
                    h(success)
                }
            }
        })
    }

    onPoll(handler: (success: boolean) => void){
        this.pollHandlers.push(handler)
    }

    async close(){
        if(this.listener){
            this.listener.close()
        }
        await this.flow
    }
}