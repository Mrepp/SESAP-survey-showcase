from typing import Dict, Any
import json

def analyze_with_llm(transcript: str, llm_client) -> Dict[str, Any]:
    prompt = f"""
Analyze the following interview transcript.

Transcript:
\"\"\"
{transcript}
\"\"\"

Return valid JSON with:
- summary.short
- summary.detailed
- themes (name, confidence 0–1)
- tags
- notable_quotes (quote, speaker, reason)
- improvement_areas (area, suggestion)

"""

    response = llm_client.chat.completions.create(
        model="gpt-4.1-mini",
        temperature=0.2,
        messages=[
            {"role": "system", "content": "You are an expert qualitative research analyst."},
            {"role": "user", "content": prompt},
        ],
    )

    content = response.choices[0].message.content
    return json.loads(content)
