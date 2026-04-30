from pathlib import Path
from .videototext import extract_audio
from openai import OpenAI

client = OpenAI()

def transcribe_whisper(video_path: str):

    audio_path = extract_audio(video_path)

    with open(audio_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f
        )

    return normalize(transcript)

def normalize(raw):
    """Produces a cleaner JSON output"""
    segments = []

    raw_segments = getattr(raw, "segments", None)

    if raw_segments:
        for i, seg in enumerate(raw_segments):
            segments.append({
                "id": i,
                "speaker": "Speaker_1",
                "start": getattr(seg, "start", None),
                "end": getattr(seg, "end", None),
                "text": getattr(seg, "text", "").strip(),
                "embedding": []
            })

    return {
        "full_text": " ".join(s["text"] for s in segments) if segments else getattr(raw, "text", ""),
        "segments": segments
    }
