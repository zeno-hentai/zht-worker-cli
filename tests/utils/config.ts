import { ConfigFileData } from '../../dist/data/config';
import fs from 'fs';

export interface CreateConfigFileOptions {
    apiToken: string
    workerPrivateKey: string
    userPublicKey: string
    configFile: string
}
export async function createConfigFile({apiToken, workerPrivateKey, userPublicKey, configFile}: CreateConfigFileOptions) {
    const data: ConfigFileData = {
        server: {
            host: 'localhost',
            port: 8080,
            https: false,
            apiToken,
            useProxy: false
        },
        worker: {
            workerPrivateKey,
            userPublicKey
        }
    }
    await fs.promises.writeFile(configFile, JSON.stringify(data))
}