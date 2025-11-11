def analyze_transcript(transcript: str):
    """
    Uses the transcript text from the interview.txt file and organizes it 
    """


    # Example: generate summary as first 200 characters
    summary = transcript[:200] + ("..." if len(transcript) > 200 else "")



    # Example: create simple theme keywords
    themes = []
    if "education" in transcript.lower():
        themes.append({"name": "Education", "importance": 0.5})
    if "career" in transcript.lower():
        themes.append({"name": "Career", "importance": 0.4})
    if not themes:
        themes.append({"name": "General", "importance": 1.0})

    # Example: fake "semantic chunks" by splitting into paragraphs
    paragraphs = [p.strip() for p in transcript.split("\n") if p.strip()]

    semantic_chunks = []
    for i, paragraph in enumerate(paragraphs, start=1):
        semantic_chunks.append({
            "id": i,
            "text": paragraph,
            "embedding": []  # placeholder until you add real embeddings
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
