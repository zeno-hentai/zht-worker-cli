import { RuntimeConfig } from '../../src/data/config';
import { ZHTWorkerClientAPI, rsaGenKey, ZHTClientAPI } from 'zht-client-api';

export interface WorkerTestConfig {
    client: ZHTClientAPI
    config: RuntimeConfig
    userPrivateKey: string
    workerId: number
    close: () => Promise<void>
}

export async function createWorkTestConfig(): Promise<WorkerTestConfig> {
    const baseURL = 'http://localhost:8080'
    const client = new ZHTClientAPI({
        baseURL,
        testHandleCookies: true
    })
    const password = 'password'
    await client.register({
        username: `username_${new Date().getTime()}`,
        password,
        masterKey: 'admin-secret'
    })
    const info = await client.infoDecrypted(password)
    if(!info.authorized){
        throw new Error("Failed to create info")
    }
    const {token} = await client.createToken("test")
    const workerClient = new ZHTWorkerClientAPI({
        apiToken: token,
        baseURL,
        proxy: null
    })
    const userPublicKey = await workerClient.getPublicKey()
    await workerClient.registerWorker()
    const workers = await client.queryWorkers(info.privateKey)
    const workerId = workers[0].id
    const keyPair = await rsaGenKey()
    const config: RuntimeConfig = {
        config: {
            server: {
                https: false,
                host: 'localhost',
                port: 8080,
                apiToken: token,
                useProxy: false
            },
            worker: {
                userPublicKey
            }
        },
        keyPair,
        client: workerClient
    }
    const close = async () => {
        client.deleteUser()
    }
    return {
        config,
        client,
        userPrivateKey: info.privateKey,
        workerId,
        close
    }
}