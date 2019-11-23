export interface BasicServerInfo {
    https: boolean
    host: string
    port: number
    apiToken: string
}

export interface GeneratedServerInfo {
    workerPublicKey: string
    workerPrivateKey: string
    userPublicKey: string
}

export interface ConfigFileData {
    server: BasicServerInfo
    worker: GeneratedServerInfo
}
