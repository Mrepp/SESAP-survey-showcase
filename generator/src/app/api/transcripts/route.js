import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function GET() {
    try {
        // Path from generator directory to data directory
        const transcriptsDir = join(process.cwd(), '..', 'data', 'analyzed_interviews', 'example_transcripts')
        const files = await readdir(transcriptsDir)
        
        const transcripts = []
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = join(transcriptsDir, file)
                const content = await readFile(filePath, 'utf-8')
                const data = JSON.parse(content)
                transcripts.push(data)
            }
        }
        
        return Response.json(transcripts)
    } catch (error) {
        console.error('Error reading transcripts:', error)
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            cwd: process.cwd()
        })
        return Response.json({ 
            error: 'Failed to load transcripts',
            details: error.message 
        }, { status: 500 })
    }
}
