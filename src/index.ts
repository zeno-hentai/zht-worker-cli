import { introProject } from './intro'

async function main(){
    const serverInfo = await introProject()
    console.log(serverInfo)
}

main()