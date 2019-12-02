import fs from 'fs'
import Path from 'path'

interface TestImageResource {
    name: string
    path: string
}

export function testImageResources(): TestImageResource[] {
    const names = ['0.jpg', '1.jpg', '2.jpg']
    return names.map(name => ({
        name,
        path: Path.resolve(__filename, '..', 'resources', 'images', name)
    }))
}