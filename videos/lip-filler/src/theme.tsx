import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import fonts from '../../public/fonts/fonts.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FONT = 'Kanit, sans-serif';

export const C = {
  pink: '#FF6FB5',
  pinkSoft: '#FF8CC6',
  magenta: '#C23A86',
  plum: '#2A0F45',
  ink: '#3B1240',
  inkSoft: '#7A3E72',
  white: '#FFFFFF',
};

export type Tone = 'dark' | 'light';

export const useKanit = () => {
  const [handle] = useState(() => delayRender('Loading Kanit'));
  useEffect(() => {
    Promise.all(
      fonts.map((f) =>
        new FontFace('Kanit', `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
          weight: f.weight,
          unicodeRange: f.range,
        })
          .load()
          .then((face) => (document.fonts as unknown as Set<FontFace>).add(face)),
      ),
    )
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};

export const useEnter = (delay = 0, damping = 16) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 170}});
};

export const rise = (p: number, dist = 40): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

// Slowly drifting gradient blobs, matching the "ความรู้ 1 นาที" series look.
export const Background: React.FC<{tone: Tone}> = ({tone}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const dx = Math.sin(t * 0.5) * 60;
  const dy = Math.cos(t * 0.4) * 50;
  const dark = tone === 'dark';
  const base = dark ? '#2A0F45' : '#F9DCEB';
  const blobs = dark
    ? [
        {x: 78 + dx / 20, y: 42 + dy / 30, r: 60, c: 'rgba(196, 52, 128, 0.85)'},
        {x: 10 - dx / 25, y: 18, r: 55, c: 'rgba(110, 48, 170, 0.9)'},
        {x: 25, y: 85 + dy / 25, r: 55, c: 'rgba(126, 58, 190, 0.75)'},
        {x: 95, y: 5, r: 40, c: 'rgba(20, 6, 36, 0.9)'},
      ]
    : [
        {x: 85 + dx / 20, y: 30, r: 60, c: 'rgba(214, 190, 245, 0.95)'},
        {x: 5, y: 60 + dy / 25, r: 60, c: 'rgba(255, 214, 196, 0.9)'},
        {x: 60, y: 100, r: 55, c: 'rgba(255, 150, 200, 0.75)'},
        {x: 20, y: 5, r: 45, c: 'rgba(255, 236, 246, 1)'},
      ];
  const bg = blobs.map((b) => `radial-gradient(circle at ${b.x}% ${b.y}%, ${b.c} 0%, rgba(0,0,0,0) ${b.r}%)`).join(', ');
  return <AbsoluteFill style={{background: `${bg}, ${base}`}} />;
};

export const Header: React.FC<{tone: Tone; progress: number}> = ({tone, progress}) => {
  const dark = tone === 'dark';
  return (
    <div style={{position: 'absolute', top: 48, left: 80, right: 80}}>
      <div style={{height: 5, borderRadius: 4, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(120,40,100,0.15)'}}>
        <div
          style={{
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${C.pink}, #B46BFF)`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 26,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: 9,
          color: dark ? 'rgba(255,255,255,0.92)' : C.ink,
        }}
      >
        WANDEE CLINIC
      </div>
    </div>
  );
};

// Voice-over caption, kept above the Reels/TikTok bottom UI.
export const Caption: React.FC<{tone: Tone; text: string; delay?: number}> = ({tone, text, delay = 4}) => {
  const p = useEnter(delay, 20);
  const dark = tone === 'dark';
  return (
    <div style={{position: 'absolute', top: 1340, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          ...rise(p, 16),
          maxWidth: 860,
          padding: '22px 36px 24px',
          borderRadius: 28,
          background: dark ? 'rgba(36, 8, 56, 0.62)' : 'rgba(255, 255, 255, 0.78)',
          border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(160, 60, 130, 0.14)',
          boxShadow: dark ? '0 16px 40px rgba(10,0,20,0.35)' : '0 16px 40px rgba(160,60,130,0.18)',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 40,
          lineHeight: 1.38,
          textAlign: 'center',
          color: dark ? '#fff' : C.ink,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Pill: React.FC<{children: React.ReactNode; tone?: Tone; filled?: boolean; size?: number; style?: React.CSSProperties}> = ({
  children,
  tone = 'dark',
  filled = true,
  size = 36,
  style,
}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1,
      padding: `${size * 0.45}px ${size * 0.85}px ${size * 0.52}px`,
      borderRadius: 999,
      color: filled ? '#fff' : tone === 'dark' ? C.pinkSoft : C.magenta,
      background: filled ? `linear-gradient(90deg, #E0479E, #9B4BE0)` : 'transparent',
      border: filled ? 'none' : `2px solid ${tone === 'dark' ? 'rgba(255,140,198,0.7)' : 'rgba(194,58,134,0.5)'}`,
      boxShadow: filled ? '0 10px 28px rgba(60,0,80,0.35), inset 0 1px 0 rgba(255,255,255,0.35)' : 'none',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const fade = (frame: number, dur: number, inF = 6, outF = 6) =>
  interpolate(frame, [0, inF, dur - outF, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
