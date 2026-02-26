import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function GET(request, { params }) {
    try {
        const { interviewId } = await params
        if (!interviewId) {
            return new Response(JSON.stringify({ error: 'interviewId required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const projectRoot = path.resolve(__dirname, '../../../../..')
        const filePath = path.join(projectRoot, '..', 'data', 'analyzed_interviews', `${interviewId}.json`)

        if (!fs.existsSync(filePath)) {
            return new Response(JSON.stringify({ error: 'Interview not found', interviewId }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const jsonData = JSON.parse(fileContent)

        return new Response(JSON.stringify(jsonData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error reading interview file:', error)
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
