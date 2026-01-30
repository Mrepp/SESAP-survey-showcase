
def basic_analysis(transcript: str):
    """
    Uses the raw transcript text to produce a JSON format
    """

    summary = transcript[:200] + ("..." if len(transcript) > 200 else "")

    themes = []
    if "education" in transcript.lower():
        themes.append({"name": "Education", "importance": 0.5})
    if "career" in transcript.lower():
        themes.append({"name": "Career", "importance": 0.4})
    if not themes:
        themes.append({"name": "General", "importance": 1.0})

    paragraphs = [p.strip() for p in transcript.split("\n") if p.strip()]

    semantic_chunks = []
    for i, paragraph in enumerate(paragraphs, start=1):
        semantic_chunks.append({
            "id": i,
            "text": paragraph,
            "embedding": []
        })

    return {
        "meta": {
            "interview_id": "file-input",
            "length_chars": len(transcript),
            "num_paragraphs": len(paragraphs),
        },
        "summary": summary,
        "themes": themes,
        "timeline": [],
        "semantic_chunks": semantic_chunks,
        "recommendations": [
            {"text": "Collect more interviews for comparison."}
        ]
    }


def analyze_transcript(transcript: str, llm_client=None):
    """
    Public API for transcript analysis.
    """

    result = basic_analysis(transcript)

    if llm_client:
        from .llm import analyze_with_llm
        try:
            result["llm_analysis"] = analyze_with_llm(transcript, llm_client)
        except Exception as e:
            result["llm_analysis_error"] = str(e)

    return result
