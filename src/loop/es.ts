import { createWebSocketClient } from '../../../zht-client-api/lib/utils/net/ws';
import { BasicServerInfo } from '../data/config';
import { ZHTWebSocketClient } from '../../../zht-client-api/dist/lib/utils/net/ws';

export function createWebSocketFromConfig({https, host, port}: BasicServerInfo): ZHTWebSocketClient {
    const url = `ws${https ? 's' : ''}://${host}:${port}`
    return createWebSocketClient(url)
}