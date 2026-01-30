from .llm import analyze_with_llm


def analyze_transcript(transcript: str, llm_client=None):
    """
    Full transcript analysis.
    Always runs deterministic analysis.
    Optionally augments with LLM insights.
    """

    result = analyze_transcript(transcript, llm_client=llm_client)


    if llm_client:
        try:
            result["llm_analysis"] = analyze_with_llm(transcript, llm_client)
        except Exception as e:
            result["llm_analysis_error"] = str(e)

    return result
