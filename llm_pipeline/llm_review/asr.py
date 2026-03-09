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

    return transcript.text