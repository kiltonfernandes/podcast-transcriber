const fileInput = document.getElementById('audio');
const transcribeBtn = document.getElementById('transcribe');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const downloadTxt = document.getElementById('download-txt');
const downloadSrt = document.getElementById('download-srt');
let currentUrls = [];

defineDownload(downloadTxt);
defineDownload(downloadSrt);

transcribeBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = 'Choose an mp3, wav, or m4a file first.';
    return;
  }
  statusEl.textContent = 'Transcribing...';
  transcribeBtn.disabled = true;
  disable(downloadTxt);
  disable(downloadSrt);
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: form,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || res.statusText);
    }
    const data = JSON.parse(text);
    transcriptEl.value = data.transcript || '';
    statusEl.textContent = 'Transcription ready.';
    setDownload(downloadTxt, data.txt || '', 'transcript.txt');
    setDownload(downloadSrt, data.srt || '', 'transcript.srt');
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
  } finally {
    transcribeBtn.disabled = false;
  }
});

function disable(link) {
  if (link.dataset.url) {
    URL.revokeObjectURL(link.dataset.url);
  }
  link.removeAttribute('href');
  link.dataset.url = '';
  link.classList.add('disabled');
  link.setAttribute('aria-disabled', 'true');
}

function setDownload(link, content, name) {
  disable(link);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.dataset.url = url;
  link.download = name;
  link.classList.remove('disabled');
  link.removeAttribute('aria-disabled');
  link.setAttribute('aria-disabled', 'false');
}

function defineDownload(link) {
  link.addEventListener('click', (event) => {
    if (link.classList.contains('disabled')) {
      event.preventDefault();
    }
  });
}
