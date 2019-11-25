import { ZHTWorkerClientAPI } from 'zht-client-api';
import { RuntimeConfig, GeneratedServerInfo } from '../data/config';
import { questionServerInfo } from './questions';
import { getBaseUrl } from './utils';
export async function launchGuide(): Promise<Pick<RuntimeConfig, 'config' | 'client'>>{
    console.log("Creating config file...")
    const server = await questionServerInfo()
    const client = new ZHTWorkerClientAPI({
        apiToken: server.apiToken,
        baseURL: getBaseUrl(server),
        proxy: null
    })
    const userPublicKey = await client.getPublicKey()
    await client.registerWorker()
    const worker: GeneratedServerInfo = {
        userPublicKey
    }
    return {
        config: {
            server,
            worker
        },
        client
    }
}