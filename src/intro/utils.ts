import { BasicServerInfo } from '../data/config';
export function getBaseUrl({https, host, port}: BasicServerInfo): string {
    return `http${https ? "s" : ""}://${host}:${port}`
}