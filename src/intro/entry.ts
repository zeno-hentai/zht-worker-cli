import Path from 'path';
import fs from 'fs';
import { ConfigFileData, RuntimeConfig } from '../data/config';
import { launchGuide } from './guide';
import { ZHTWorkerClientAPI } from 'zht-client-api';
import { getBaseUrl } from './utils';
export async function introProject(): Promise<Omit<RuntimeConfig, 'keyPair'>> {
    const configFile = Path.resolve(process.env["ZHT_WORKER_CONFIG"] || "./work-config.json")
    console.log(`Using config file: ${configFile}`)
    if(fs.existsSync(configFile)){
        const data = await fs.promises.readFile(configFile)
        const config = JSON.parse(new TextDecoder().decode(data)) as ConfigFileData
        const client = new ZHTWorkerClientAPI({
            apiToken: config.server.apiToken,
            baseURL: getBaseUrl(config.server),
            proxy: null
        })
        return {
            config,
            client
        }
    }else{
        const runtime = await launchGuide()
        await fs.promises.writeFile(configFile, JSON.stringify(runtime.config))
        return await runtime
    }
}