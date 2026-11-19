"""Magnific TTS WAVs wrap a second WAV inside the outer `data` chunk: the inner
RIFF header plays as a click at the start and ~7.6 KB of trailing metadata plays
as a loud burst at the end. Keep only the inner `data` chunk.

    python3 fix_nested_wav.py in.wav out.wav
"""
import sys, wave

src, dst = sys.argv[1], sys.argv[2]
w = wave.open(src)
raw = w.readframes(w.getnframes())
if raw[:4] == b'RIFF' and raw[8:12] == b'WAVE':
    i = 12
    while i + 8 <= len(raw):
        cid, size = raw[i:i + 4], int.from_bytes(raw[i + 4:i + 8], 'little')
        if cid == b'data':
            raw = raw[i + 8:i + 8 + size]
            break
        i += 8 + size + (size & 1)
out = wave.open(dst, 'wb')
out.setnchannels(w.getnchannels()); out.setsampwidth(w.getsampwidth()); out.setframerate(w.getframerate())
out.writeframes(raw[: len(raw) // (w.getsampwidth() * w.getnchannels()) * w.getsampwidth() * w.getnchannels()])
out.close()
