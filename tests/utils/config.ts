import fs from 'fs';
import { ConfigFileData } from '../../src/data';

export interface CreateConfigFileOptions {
    apiToken: string
    workerPrivateKey: string
    userPublicKey: string
    configFile: string
}
export async function createConfigFile({apiToken, userPublicKey, configFile}: CreateConfigFileOptions) {
    const data: ConfigFileData = {
        server: {
            host: 'localhost',
            port: 8080,
            https: false,
            apiToken,
            useProxy: false
        },
        worker: {
            userPublicKey
        }
    }
    await fs.promises.writeFile(configFile, JSON.stringify(data))
}