# Podcast Transcriber

Static frontend + Python serverless backend using Whisper.

## Deploy to Vercel
1. Install the [Vercel CLI](https://vercel.com/cli) if you have not already.
2. Run `vercel` in this project root and follow the prompts; Vercel uses `requirements.txt` and `vercel.json` to build the app.
3. After deployment, your `/` route serves the UI and `/api/transcribe` powers the transcription.

## Run locally
1. Create a virtual environment and install dependencies: `python -m venv .venv && .\.venv\Scripts\activate && pip install -r requirements.txt`.
2. Start the local server with `vercel dev` to mimic the deployed environment.
3. Open the URL shown by `vercel dev` in your browser.

## Upload audio
1. Use the file picker in the UI to select an mp3, wav, or m4a file.
2. Click **Transcribe**; the backend sends the file to Whisper and returns text + SRT.
3. Download the generated `transcript.txt` and `transcript.srt` using the provided buttons after the operation completes.
