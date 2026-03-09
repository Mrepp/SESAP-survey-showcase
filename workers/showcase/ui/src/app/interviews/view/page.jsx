'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Text } from '@chakra-ui/react'
import InterviewPageClient from './InterviewPageClient'

function InterviewViewInner() {
    const searchParams = useSearchParams()
    const interviewId = searchParams.get('id')
    if (!interviewId) return <Text color="red">No interview ID specified.</Text>
    return <InterviewPageClient interviewId={interviewId} />
}

export default function Page() {
    return (
        <Suspense fallback={<Text>Loading...</Text>}>
            <InterviewViewInner />
        </Suspense>
    )
}
