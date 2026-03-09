export function buildAnalysisPrompt(transcript: string): string {
  return `You are an expert qualitative researcher analyzing a student interview transcript from the SESAP (Student Experience Survey & Analysis Project). Analyze the following transcript and produce a structured JSON response.

Your response MUST be valid JSON matching this exact structure:

{
  "summaries": [
    {
      "summaryText": "A concise summary of a key aspect of the interview",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "confidence": 0.0 to 1.0
    }
  ],
  "timeline": [
    {
      "event": "Description of a significant event or experience",
      "period": "e.g. freshman year, summer 2022, senior year",
      "significance": "Why this event matters in the student's journey"
    }
  ],
  "themes": [
    {
      "title": "Must be one of: Academic Difficulty | Belonging | Career Preparation | Cultural Representation | Faculty Support | Family Pressure | Financial Struggles | Identity & Discrimination | Mental Health | Language Barriers | Peer Relationships | Personal Growth | Support Networks | Work-Life Balance",
      "description": "Detailed description of the theme",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "frequency": 1 to 10 (how often this theme appears),
      "relatedQuoteIds": []
    }
  ],
  "quotes": [
    {
      "quoteText": "Exact quote from the transcript",
      "context": "What was being discussed when this quote occurred",
      "sentiment": "positive | negative | neutral | mixed",
      "tags": ["relevant", "tags"],
      "themeIds": []
    }
  ],
  "areasForImprovement": [
    {
      "area": "Short title for the area",
      "description": "What could be improved and why",
      "category": "academic | social | personal | career | financial | campus_life | mental_health | diversity | extracurricular | other",
      "priority": "high | medium | low"
    }
  ]
}

Guidelines:
- Extract 3-6 summaries covering the main topics discussed
- Identify 3-8 timeline points in chronological order
- Identify 3-7 recurring themes with meaningful descriptions
- Theme titles MUST be selected exactly from this list: Academic Difficulty, Belonging, Career Preparation, Cultural Representation, Faculty Support, Family Pressure, Financial Struggles, Identity & Discrimination, Mental Health, Language Barriers, Peer Relationships, Personal Growth, Support Networks, Work-Life Balance
- Do NOT invent new theme titles or modify the provided ones
- Select only themes that are actually present in the interview
- Extract 5-15 significant direct quotes that illustrate key points
- Identify 2-5 areas for improvement mentioned or implied
- Do NOT include "id" fields - those will be assigned later
- The relatedQuoteIds and themeIds arrays should be empty - they will be linked later
- Ensure all quotes are verbatim from the transcript
- Confidence scores should reflect how clearly the topic was discussed
- Be thorough but concise in descriptions

TRANSCRIPT:
${transcript}

Respond ONLY with the JSON object. Do not include any text before or after the JSON.`;
}
