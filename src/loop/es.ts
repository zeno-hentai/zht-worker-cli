
import { BasicServerInfo } from '../data/config';
import { ZHTWebSocketClient, createWebSocketClient } from 'zht-client-api';

export function createWebSocketFromConfig({https, host, port}: BasicServerInfo): ZHTWebSocketClient {
    const url = `ws${https ? 's' : ''}://${host}:${port}`
    return createWebSocketClient(url)
}