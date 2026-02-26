import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function GET() {
    try {
        const projectRoot = path.resolve(__dirname, '../../../../..')
        const dirPath = path.join(projectRoot, '..', 'data', 'analyzed_interviews')

        if (!fs.existsSync(dirPath)) {
            return new Response(JSON.stringify({ count: 0 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const files = fs.readdirSync(dirPath)
        const count = files.filter((f) => f.endsWith('.json')).length

        return new Response(JSON.stringify({ count }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error reading analyzed_interviews:', error)
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
