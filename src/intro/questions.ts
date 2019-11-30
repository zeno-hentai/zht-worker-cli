import Inquirer = require('inquirer')
import {BasicServerInfo} from '../data'
import { BasicServerInfoMain, CheckPublicKeyInfo } from '../data/config';

export async function questionServerInfo(): Promise<BasicServerInfo> {
    const answersMainPart = await Inquirer.prompt([
        {
            type: "input",
            name: "host",
            message: "Server Host Name:",
            default: "zht.jaccobkii.com"
        }, {
            type: "confirm",
            name: "https",
            message: "Using HTTPs?",
            default: true
        }, {
            type: "number",
            name: "port",
            message: "Server Port:",
            default: (answers: Exclude<BasicServerInfo, "port">) => answers.https ? 443 : 80
        }, {
            type: "input",
            name: "apiToken",
            message: "API Token:"
        }, {
            type: "confirm",
            name: "useProxy",
            message: "Use HTTP Proxy?"
        }
    ]) as BasicServerInfoMain
    const answersProxyPart: {proxyHost: string, proxyPort: number, useProxy: true} | {useProxy: false} = 
        answersMainPart.useProxy ?
            {
                useProxy: true,
                ...await Inquirer.prompt([
                    {
                        type: "input",
                        name: "proxyHost",
                        message: "HTTP Proxy Host:",
                        default: "localhost"
                    }, {
                        type: "number",
                        name: "proxyPort",
                        message: "HTTP Proxy Port:",
                        default: 8080
                    }
                ])
            } : {useProxy: false}
    return {
        ...answersMainPart,
        ...answersProxyPart
    }
}
