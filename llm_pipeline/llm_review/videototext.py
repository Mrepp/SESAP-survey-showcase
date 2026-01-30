import subprocess
from pathlib import Path


def extract_audio(video_path: str) -> Path:

    video = Path(video_path)
    audio = video.with_suffix(".wav")

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(video),
            "-ac", "1",
            "-ar", "16000",
            str(audio),
        ],

        check = True,
        stdout = subprocess.DEVNULL,
        stderr = subprocess.DEVNULL,

    )

    return audio
