import { parseVideoEmbed } from '@sesap/shared'

export function resolveInterviewVideo(interview) {
    if (interview?.video?.embedUrl) return interview.video

    const legacyUrl = interview?.metadata?.interviewURL
    if (typeof legacyUrl !== 'string' || !legacyUrl.trim()) return null

    try {
        return parseVideoEmbed(legacyUrl)
    } catch {
        return null
    }
}
