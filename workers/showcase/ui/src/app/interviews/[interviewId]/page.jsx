import path from 'path'
import fs from 'fs'
import InterviewPageClient from './InterviewPageClient'

// Build-time only: read interview IDs from public (no fetch — avoids undefined fetch in static export).
function getInterviewIds() {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'assets', 'build', 'interviews.json')
    if (fs.existsSync(publicPath)) {
      const raw = fs.readFileSync(publicPath, 'utf-8')
      const data = JSON.parse(raw)
      const list = Array.isArray(data) ? data : data?.interviews ?? []
      const ids = list
        .map((iv) => String(iv.id ?? ''))
        .filter(Boolean)
      if (ids.length > 0) return ids
    }
  } catch {
    // ignore
  }
  return []
}

export function generateStaticParams() {
  const ids = getInterviewIds()
  if (ids.length === 0) {
    return [{ interviewId: '__placeholder__' }]
  }
  return ids.map((interviewId) => ({ interviewId }))
}

export default function Page({ params }) {
  return <InterviewPageClient params={params} />
}
