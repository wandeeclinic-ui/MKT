"""Render a cue sheet with NO saturation/drive: linear peak-normalise to -6 dBFS.
    python3 sfx/cues/render_linear.py sfx/cues/lipfiller.py sfx/cues/lipfiller_tl.json out.wav
"""
import importlib.util, json, struct, sys, wave
sys.path.insert(0, '.')
from sfx.mix import Mix, SR

spec = importlib.util.spec_from_file_location('cues', sys.argv[1]); cues = importlib.util.module_from_spec(spec); spec.loader.exec_module(cues)
tl = json.load(open(sys.argv[2]))
mix = Mix(tl['duration'], seed=getattr(cues, 'SEED', 11)); cues.score(mix, tl)
peak = max(max(map(abs, mix.left)), max(map(abs, mix.right))) or 1.0
g = 10 ** (-6 / 20) / peak
with wave.open(sys.argv[3], 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes(b''.join(struct.pack('<hh', int(a * g * 32767), int(b * g * 32767)) for a, b in zip(mix.left, mix.right)))
print('peak gain', round(g, 3))
