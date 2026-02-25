from openai import OpenAI
from pathlib import Path


def transcribe_whisper(file_path: str) -> str:
    """
    Transcribe an audio or video file using Whisper API.
    supports different video type formets
    """

    client = OpenAI()
    path = Path(file_path)

    # file path checker
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    # uploads file using Whisper
    with open(path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f
        )

    return transcript.text
