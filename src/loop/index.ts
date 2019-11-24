import { RuntimeConfig } from '../../dist/data/config';
import { ZHTCrawlerManager } from './manager';
export * from './manager'
export * from './crawler'
export function initializeLoop(config: RuntimeConfig): ZHTCrawlerManager{
    let forceExit = false
    const manager = new ZHTCrawlerManager(config)
    process.on('SIGINT', function() {
        console.log("Caught interrupt signal");
        if(forceExit){
            console.log("Forced exited.")
            process.exit(-1)
        }else{
            console.log("Quitting, press Ctrl+C again to force exit.")
            forceExit = true
            manager.close().then(() => {
                process.exit()
            })
        }
    })
    console.log("Worker launched, press Ctrl+C to exit.")
    return manager
}