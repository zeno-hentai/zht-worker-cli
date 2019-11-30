import { introProject } from './intro'
import { rsaGenKey } from 'zht-client-api';
import { initializeLoop } from './loop/index';
import { RuntimeConfig } from './data/config';
import { ZHTKeyPair } from 'zht-client-api';

async function main(){
    const serverInfo = await introProject()
    const keyPair: ZHTKeyPair = await await rsaGenKey()
    const runtimeConfig: RuntimeConfig = {
        ...serverInfo,
        keyPair
    }
    await new Promise((resolve, reject) => {
        initializeLoop(runtimeConfig, resolve)
    })
}

main()