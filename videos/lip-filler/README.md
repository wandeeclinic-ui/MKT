# ความรู้ 1 นาที — ฟิลเลอร์ปาก (Reels/TikTok 9:16)

Explainer about the five lip filler shapes, based on
https://wandeeclinic.com/ฟิลเลอร์-ปาก/ . Brand colours from "Code Color 2026"
(pinks ~60%, white ~25%, black ~10%; wine #7b032e and peach #fbdabd as accents).
Real lip photos are cropped from that page's own images (`public/lipfiller/`);
no doctor photos. `src/Lips.tsx` draws the small diagram badges.

Status: **voiced v1** — Thai voice-over by Magnific TTS (Gemini 3.8 "sonic_boom",
voice "Autonoe", one file per scene in `public/lipfiller/vo/`). Scene durations
follow `public/lipfiller/vo/timing.json` (lead + VO length + 0.45s tail).

Audio: `sfx/lipfiller.py` is a cue sheet for the claude-motion sfx engine
(whooshes on cuts, pops, soft pad bed); `sfx/mix.sh` mixes the VO files, the SFX
stem and loudness-normalises to -14 LUFS. Render the video muted, then mux.

## Files

- `src/LipFiller.tsx` — script (VO text = on-screen caption), scenes, composition
- `src/Lips.tsx` — parametric lips (`SHAPES`), morphing via `mixShape`
- `src/theme.tsx` — series look: background, header, caption box, Kanit loader
- `public/fonts/` — Kanit (SIL OFL) woff2 + `fonts.json` manifest
- `public/lipfiller/` — logo (black/white, transparent) and lip photo crops
- `storyboard.jpg` — one still per scene

## Run

Drop `src/` into a Remotion 4 project as `src/lipfiller/`, copy `public/fonts/`
and `public/lipfiller/` into its `public/`, and register:

```tsx
<Composition id="LipFiller" component={LipFiller} durationInFrames={TOTAL_FRAMES}
  fps={30} width={1080} height={1920} />
```

Content notes: avoid absolute claims (e.g. "ปลอดภัย 100%", "อันดับ 1");
keep "ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล" on fact and CTA scenes.

### Audio notes (v1.3)
- The TTS files come out clipped at full scale. `public/lipfiller/vo/*.wav` are
  de-clipped (`adeclip`) and lowered 9 dB before mixing; keep the raw files out.
- Render the SFX stem with `sfx/render_linear.py` (no saturation). The engine's
  own `master()` drives a sparse stem into tanh to reach -14 LUFS, which made the
  pops sound broken.
- Final mix: loudnorm -14 LUFS / -2 dBTP so the AAC in the MP4 stays below 0 dBFS.
- Scene-change sounds and hook ticks were removed on request.
