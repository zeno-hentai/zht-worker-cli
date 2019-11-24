import { ZHTWorkerClientAPI } from "zht-client-api";

export interface BasicServerInfoMain {
    https: boolean
    host: string
    port: number
    apiToken: string,
    useProxy: boolean
}

export type BasicServerInfo = Exclude<BasicServerInfoMain, 'useProxy'> & (
    {useProxy: true, proxyHost: string, proxyPort: number} |
    {useProxy: false}
)

export interface GeneratedServerInfo {
    workerPrivateKey: string
    userPublicKey: string
}

export interface ConfigFileData {
    server: BasicServerInfo
    worker: GeneratedServerInfo
}

export interface RuntimeConfig {
    config: ConfigFileData
    client: ZHTWorkerClientAPI
}