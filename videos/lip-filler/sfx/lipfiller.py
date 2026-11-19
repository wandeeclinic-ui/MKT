"""SFX + soft bed for the lip filler explainer. Scene times come from public/lipfiller/vo/timing.json.

    python3 -m sfx sfx/cues/lipfiller.py --timeline sfx/cues/lipfiller_tl.json
"""
from sfx.synth import blip, chime, click, envelope, pad, pop, whoosh

OUT = "public/lipfiller/sfx.wav"
TARGET_LUFS = -14.0

# F major: soft, bright, not distracting under a voice.
BED = [174.61, 261.63, 349.23, 440.0, 523.25]
BED_B = [146.83, 220.0, 293.66, 349.23, 440.0]


def score(mix, tl):
    put = mix.put
    dur = tl["duration"]
    s = tl["starts"]  # scene id -> start seconds

    vol = envelope([(0, 0), (0.6, 1), (dur - 1.5, 1), (dur, 0)])
    mix.put_stereo(0, *pad(dur, [(0, BED), (s["facts"], BED_B), (s["cta"], BED)], volume=vol), gain=0.03)

    # hook: punch on frame 0, ticks as the photos switch
    put(0.0, whoosh(0.3, 2600, 500, peak=0.15), 0.5)
    put(0.02, pop(220, 120, dur=0.18), 0.35)
    put(0.07, pop(700, 1050, dur=0.14), 0.22)
    t = 0.5
    while t < s["what"] - 0.2:
        put(t, click(2200, dur=0.04), 0.12)
        t += 0.5

    order = ["what", "shape-natural", "shape-cherry", "shape-sexy", "shape-cupid", "shape-lifted", "facts", "care", "cta"]
    for i, k in enumerate(order):
        c = s[k]
        put(c - 0.3, whoosh(0.4, 400, 2600, peak=0.75), 0.32, -0.3 + 0.6 * (i % 2))
        if k.startswith("shape-"):
            put(c + 14 / 30, pop(520 + 40 * i, 900 + 40 * i, dur=0.14), 0.26)
    for j in range(3):
        put(s["facts"] + (6 + j * 8) / 30, pop(480 + 120 * j, 820 + 120 * j, dur=0.14), 0.24)
    for j in range(4):
        put(s["care"] + (6 + j * 6) / 30, blip(659.25 + 110 * j, dur=0.25, tau=0.07), 0.14)
    put(s["cta"] + 14 / 30, chime([1046.5, 1318.5, 1568.0], dur=1.4, tau=0.5), 0.12)
