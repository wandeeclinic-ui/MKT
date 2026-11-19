# ความรู้ 1 นาที — ฟิลเลอร์ปาก (Reels/TikTok 9:16)

Motion-graphic explainer about the five lip filler shapes, based on
https://wandeeclinic.com/ฟิลเลอร์-ปาก/ . No doctor or patient photos: every
visual is drawn in code (`src/Lips.tsx` is a parametric lip illustration).

Status: **storyboard / silent draft for review** — voice-over not recorded yet.
Scene durations in `SCENES` (`src/LipFiller.tsx`) are placeholders and should
follow the voice-over once it exists.

## Files

- `src/LipFiller.tsx` — script (VO text = on-screen caption), scenes, composition
- `src/Lips.tsx` — parametric lips (`SHAPES`), morphing via `mixShape`
- `src/theme.tsx` — series look: background, header, caption box, Kanit loader
- `public/fonts/` — Kanit (SIL OFL) woff2 + `fonts.json` manifest
- `storyboard.jpg` — one still per scene

## Run

Drop `src/` into a Remotion 4 project as `src/lipfiller/`, copy `public/fonts/`
into its `public/`, and register:

```tsx
<Composition id="LipFiller" component={LipFiller} durationInFrames={TOTAL_FRAMES}
  fps={30} width={1080} height={1920} />
```

Content notes: avoid absolute claims (e.g. "ปลอดภัย 100%", "อันดับ 1");
keep "ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล" on fact and CTA scenes.
