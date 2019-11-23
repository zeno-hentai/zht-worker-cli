import { questionServerInfo } from './intro/questions'

async function main(){
    const serverInfo = await questionServerInfo()
    console.log(serverInfo)
}

main()