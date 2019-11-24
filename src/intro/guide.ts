import { ZHTWorkerClientAPI } from 'zht-client-api';
import { RuntimeConfig, GeneratedServerInfo } from '../data/config';
import { questionServerInfo } from './questions';
import { getBaseUrl } from './utils';
export async function launchGuide(): Promise<RuntimeConfig>{
    console.log("Creating config file...")
    const server = await questionServerInfo()
    const client = new ZHTWorkerClientAPI({
        apiToken: server.apiToken,
        baseURL: getBaseUrl(server),
        proxy: null
    })
    const userPublicKey = await client.getPublicKey()
    const {privateKey: workerPrivateKey} = await client.registerWorker(userPublicKey)
    const worker: GeneratedServerInfo = {
        userPublicKey, workerPrivateKey
    }
    return {
        config: {
            server,
            worker
        },
        client
    }
}