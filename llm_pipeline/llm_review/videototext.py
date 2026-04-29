import subprocess
from pathlib import Path


def extract_audio(video_path: str) -> Path:

    video = Path(video_path)
    audio = video.with_suffix(".wav")

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(video),
            "-vn",   
            "-acodec", "pcm_s16le", 
            "-ac", "1",
            "-ar", "16000",
            str(audio),
        ],

        check = True,

    )

    return audio
