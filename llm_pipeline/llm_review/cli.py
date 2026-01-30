import json
import argparse
from openai import OpenAI
from pathlib import Path

from .analysis import analyze_transcript

 # python -m llm_pipeline.llm_review.cli --file llm_pipeline\transcripts\interview1.txt --pretty

def load_transcript(input_path: str | None, raw_text: str | None) -> str:
    """Load transcript from file OR raw text."""
    if input_path:
        p = Path(input_path)
        if not p.exists():
            raise FileNotFoundError(f"Transcript file not found: {input_path}")
        return p.read_text(encoding="utf-8")

    if raw_text:
        return raw_text

    raise ValueError("You must provide --file or --text")


def main():
    parser = argparse.ArgumentParser(

        description="Process a transcribed interview into SESAP JSON format."

    )

    parser.add_argument("--llm",
    action="store_true",
    help="Enable LLM-based analysis"
)
    parser.add_argument("--file", "-f", help="Path to transcript text file")
    parser.add_argument("--text", "-t", help="Raw transcript text")
    parser.add_argument("--save", "-s", help="Where to save the resulting JSON")
    parser.add_argument("--pretty", action="store_true",
                        help="Pretty-print the JSON output")

    args = parser.parse_args()

    transcript = load_transcript(args.file, args.text)

    llm_client = None
    if args.llm:
        llm_client = OpenAI()


    # Run the actual LLM analysis → your repo will generate structured JSON
    result = analyze_transcript(transcript, llm_client=llm_client)

    # Prints JSON as the output
    if args.pretty:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(result, ensure_ascii=False))

    # Save to file if requested
    if args.save:
        out_path = Path(args.save)
        out_path.write_text(
            json.dumps(result, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"\nSaved JSON to {out_path}")


if __name__ == "__main__":
    main()
