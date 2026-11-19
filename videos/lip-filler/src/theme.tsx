import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import fonts from '../../public/fonts/fonts.json';

export const FPS = 30;
export const FONT = 'Kanit, sans-serif';

// Wandee Clinic "Code Color 2026". Mix: pinks ~60%, white ~25%, black ~10%, wine/peach accents.
export const B = {
  pink: '#ee4f96',
  hot: '#ef3b8b',
  soft: '#ee6fa8',
  wine: '#7b032e',
  peach: '#fbdabd',
  black: '#000000',
  white: '#ffffff',
};

export type Tone = 'pink' | 'white' | 'black';

export const ink = (tone: Tone) => (tone === 'black' ? B.white : B.black);

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

export const Background: React.FC<{tone: Tone}> = ({tone}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const dx = Math.sin(t * 0.5) * 4;
  const dy = Math.cos(t * 0.4) * 4;
  if (tone === 'pink') {
    return (
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${80 + dx}% ${18 + dy}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 38%)`,
            `radial-gradient(circle at ${8 - dx}% ${70 + dy}%, rgba(251,218,189,0.45) 0%, rgba(251,218,189,0) 40%)`,
            `radial-gradient(circle at 50% 105%, rgba(123,3,46,0.28) 0%, rgba(123,3,46,0) 45%)`,
            `linear-gradient(165deg, ${B.hot} 0%, ${B.pink} 50%, ${B.soft} 100%)`,
          ].join(', '),
        }}
      />
    );
  }
  if (tone === 'black') {
    return (
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${85 + dx}% ${20 + dy}%, rgba(239,59,139,0.45) 0%, rgba(239,59,139,0) 42%)`,
            `radial-gradient(circle at ${10 - dx}% 90%, rgba(238,111,168,0.3) 0%, rgba(238,111,168,0) 40%)`,
            B.black,
          ].join(', '),
        }}
      />
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(circle at ${88 + dx}% ${12 + dy}%, rgba(238,111,168,0.22) 0%, rgba(238,111,168,0) 40%)`,
          `radial-gradient(circle at ${5 - dx}% 88%, rgba(251,218,189,0.6) 0%, rgba(251,218,189,0) 42%)`,
          B.white,
        ].join(', '),
      }}
    />
  );
};

export const Logo: React.FC<{tone: Tone; height?: number}> = ({tone, height = 56}) => (
  <Img
    src={staticFile(`lipfiller/logo-${tone === 'black' ? 'white' : 'black'}.png`)}
    style={{height, width: 'auto', display: 'block'}}
  />
);

export const Header: React.FC<{tone: Tone; progress: number}> = ({tone, progress}) => {
  const track = tone === 'black' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.14)';
  const fill = tone === 'white' ? B.hot : tone === 'black' ? B.pink : B.black;
  return (
    <div style={{position: 'absolute', top: 48, left: 80, right: 80}}>
      <div style={{height: 5, borderRadius: 4, background: track}}>
        <div style={{width: `${Math.max(0, Math.min(1, progress)) * 100}%`, height: '100%', borderRadius: 4, background: fill}} />
      </div>
      <div style={{marginTop: 28, display: 'flex', justifyContent: 'center'}}>
        <Logo tone={tone} height={58} />
      </div>
    </div>
  );
};

// Voice-over caption, kept above the Reels/TikTok bottom UI.
export const Caption: React.FC<{tone: Tone; text: string; delay?: number}> = ({tone, text, delay = 4}) => {
  const p = useEnter(delay, 20);
  const onWhite = tone === 'white';
  return (
    <div style={{position: 'absolute', top: 1370, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          ...rise(p, 16),
          maxWidth: 880,
          padding: '22px 36px 24px',
          borderRadius: 28,
          background: onWhite ? B.black : B.white,
          boxShadow: '0 16px 40px rgba(60,0,30,0.22)',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 40,
          lineHeight: 1.38,
          textAlign: 'center',
          color: onWhite ? B.white : B.black,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Pill: React.FC<{
  children: React.ReactNode;
  variant?: 'black' | 'white' | 'pink' | 'outline-black' | 'outline-white' | 'peach';
  size?: number;
  style?: React.CSSProperties;
}> = ({children, variant = 'black', size = 36, style}) => {
  const v = {
    black: {bg: B.black, fg: B.white, bd: 'none'},
    white: {bg: B.white, fg: B.black, bd: 'none'},
    pink: {bg: B.hot, fg: B.white, bd: 'none'},
    peach: {bg: B.peach, fg: B.wine, bd: 'none'},
    'outline-black': {bg: 'transparent', fg: B.black, bd: `2.5px solid ${B.black}`},
    'outline-white': {bg: 'transparent', fg: B.white, bd: `2.5px solid ${B.white}`},
  }[variant];
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        padding: `${size * 0.45}px ${size * 0.85}px ${size * 0.52}px`,
        borderRadius: 999,
        color: v.fg,
        background: v.bg,
        border: v.bd,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Real photo in a white frame (the "white 25%" of the palette).
export const PhotoFrame: React.FC<{
  src: string;
  width: number;
  height: number;
  radius?: number;
  border?: number;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({src, width, height, radius = 40, border = 14, style, imgStyle, children}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      padding: border,
      borderRadius: radius,
      background: B.white,
      boxShadow: '0 24px 60px rgba(90,0,40,0.28)',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <div style={{width: '100%', height: '100%', borderRadius: radius - border / 2, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...imgStyle}} />
    </div>
    {children}
  </div>
);
