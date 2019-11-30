import { ZHTWorkerClientAPI, sha256Hash } from 'zht-client-api';
import { RuntimeConfig, GeneratedServerInfo } from '../data/config';
import { questionServerInfo } from './questions';
import { getBaseUrl } from './utils';
export async function launchGuide(): Promise<Pick<RuntimeConfig, 'config' | 'client'>>{
    console.log("Creating config file...")
    const server = await questionServerInfo()
    const [sig, apiToken] = server.apiToken.split(":")
    server.apiToken = apiToken
    const client = new ZHTWorkerClientAPI({
        apiToken: server.apiToken,
        baseURL: getBaseUrl(server),
        proxy: null
    })
    const userPublicKey = await client.getPublicKey()
    const publicKeySig = await sha256Hash(userPublicKey)
    if(publicKeySig.slice(0, 15) !== sig){
        console.log("Man-in-the-middle attack detected. Abort.")
        process.exit(-1)
    }
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