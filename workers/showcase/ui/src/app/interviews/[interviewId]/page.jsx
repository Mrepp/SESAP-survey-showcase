import InterviewPageClient from './InterviewPageClient'

// Static export requires at least one path; real interview IDs are loaded client-side via worker API
export async function generateStaticParams() {
  return [{ interviewId: '__placeholder__' }]
}

export default function Page({ params }) {
  return <InterviewPageClient params={params} />
}
