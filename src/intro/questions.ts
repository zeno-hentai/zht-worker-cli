import Inquirer = require('inquirer')

export async function questionServerInfo(): Promise<InputServerInfo> {
    const answers = await Inquirer.prompt([
        {
            type: "input",
            name: "host",
            message: "Server Host Name:",
            default: "zht.jaccobkii.com"
        }, {
            type: "confirm",
            name: "https",
            message: "Using HTTPs:",
            default: true
        }, {
            type: "number",
            name: "port",
            message: "Server Port:",
            default: (answers: Exclude<InputServerInfo, "port">) => answers.https ? 443 : 80
        }, {
            type: "input",
            name: "apiToken",
            message: "API Token:"
        }
    ])
    return answers as InputServerInfo
}