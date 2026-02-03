import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function GET(request, { params }) {
    try {
        const { filename } = params
        
        // Calculate path: from generator/src/app/api/transcripts/[filename]/route.js
        // Go up to generator, then to ../data/analyzed_interviews/example_transcripts
        // __dirname is generator/src/app/api/transcripts/[filename]
        // So we need: __dirname -> ../../../../.. -> ../data
        const projectRoot = path.resolve(__dirname, '../../../../..')
        const dataPath = path.join(
            projectRoot,
            '..',
            'data',
            'analyzed_interviews',
            'example_transcripts',
            filename
        )
        
        console.log('Looking for file at:', dataPath)
        console.log('File exists:', fs.existsSync(dataPath))
        
        // Check if file exists
        if (!fs.existsSync(dataPath)) {
            console.error('File not found at:', dataPath)
            return new Response(JSON.stringify({ error: 'File not found', path: dataPath }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }
        
        // Read and return the file
        const fileContent = fs.readFileSync(dataPath, 'utf-8')
        const jsonData = JSON.parse(fileContent)
        
        // Log the structure - could be array or object
        const isArray = Array.isArray(jsonData)
        const wordCount = isArray ? jsonData.length : (jsonData.words?.length || 0)
        console.log(`Successfully loaded file ${filename}, isArray: ${isArray}, word count: ${wordCount}`)
        
        return new Response(JSON.stringify(jsonData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error reading transcript file:', error)
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
