import json
import os
import tempfile

import ffmpeg
import whisper

MODEL = None

def get_model():
    global MODEL
    if MODEL is None:
        MODEL = whisper.load_model("base")
    return MODEL

def fmt(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int(t * 1000) % 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"}),
            "headers": {"Content-Type": "application/json"},
        }
    files = getattr(request, "files", {})
    uploaded = files.get("file") if files else None
    if not uploaded:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "No file provided"}),
            "headers": {"Content-Type": "application/json"},
        }
    suffix = os.path.splitext(uploaded.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded.file.read())
        tmp_path = tmp.name
    try:
        ffmpeg.probe(tmp_path)
    except ffmpeg.Error:
        pass
    model = get_model()
    result = model.transcribe(tmp_path)
    os.unlink(tmp_path)
    transcript = result.get("text", "").strip()
    srt_lines = []
    for idx, segment in enumerate(result.get("segments", []), 1):
        srt_lines.append(str(idx))
        srt_lines.append(f"{fmt(segment['start'])} --> {fmt(segment['end'])}")
        srt_lines.append(segment.get("text", "").strip())
        srt_lines.append("")
    payload = {
        "transcript": transcript,
        "txt": transcript,
        "srt": "\n".join(srt_lines).strip(),
    }
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
