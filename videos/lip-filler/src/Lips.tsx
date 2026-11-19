import React from 'react';

// Parametric line-art lips. All values are in a 600-wide viewBox centred on the mouth line.
export type LipShape = {
  width: number; // corner to corner
  upper: number; // height of the upper lip at the peaks
  lower: number; // depth of the lower lip at the centre
  bow: number; // dip of the cupid's bow between the peaks
  peak: number; // distance of each peak from the centre
  tubercle: number; // centre bump of the upper lip into the mouth line
  corner: number; // + droops the corners, - lifts them
  roundLower: number; // 0 = flat wide lower lip, 1 = round "cherry" lower lip
};

export const SHAPES: Record<string, LipShape> = {
  before: {width: 430, upper: 46, lower: 62, bow: 10, peak: 52, tubercle: 4, corner: 14, roundLower: 0.2},
  natural: {width: 450, upper: 64, lower: 88, bow: 16, peak: 58, tubercle: 8, corner: 2, roundLower: 0.35},
  cherry: {width: 420, upper: 72, lower: 112, bow: 18, peak: 52, tubercle: 20, corner: 4, roundLower: 1},
  sexy: {width: 470, upper: 100, lower: 104, bow: 20, peak: 64, tubercle: 10, corner: 0, roundLower: 0.45},
  cupid: {width: 450, upper: 92, lower: 102, bow: 40, peak: 74, tubercle: 12, corner: 0, roundLower: 0.55},
  lifted: {width: 450, upper: 66, lower: 86, bow: 16, peak: 58, tubercle: 8, corner: -16, roundLower: 0.35},
};

export const mixShape = (a: LipShape, b: LipShape, t: number): LipShape => {
  const out = {} as LipShape;
  (Object.keys(a) as (keyof LipShape)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
};

const paths = (s: LipShape) => {
  const hw = s.width / 2;
  const c = s.corner;
  const pk = s.peak;
  const top = -s.upper;
  const dip = top + s.bow;
  // upper lip outline: left corner -> left peak -> bow -> right peak -> right corner
  const upper = [
    `M ${-hw} ${c}`,
    `C ${-hw * 0.72} ${c - s.upper * 0.35}, ${-pk - hw * 0.28} ${top}, ${-pk} ${top}`,
    `C ${-pk * 0.55} ${top}, ${-pk * 0.18} ${dip}, 0 ${dip}`,
    `C ${pk * 0.18} ${dip}, ${pk * 0.55} ${top}, ${pk} ${top}`,
    `C ${pk + hw * 0.28} ${top}, ${hw * 0.72} ${c - s.upper * 0.35}, ${hw} ${c}`,
  ].join(' ');
  // mouth line: corner -> tubercle -> corner (and its reverse, for closing fills)
  const tb = s.tubercle;
  const a1 = `${-hw * 0.55} ${c * 0.4 - 2}`;
  const a2 = `${-hw * 0.3} ${-4}`;
  const p1 = `${-hw * 0.12} ${tb * 0.25}`;
  const q = `0 ${tb}`;
  const p2 = `${hw * 0.12} ${tb * 0.25}`;
  const b1 = `${hw * 0.3} ${-4}`;
  const b2 = `${hw * 0.55} ${c * 0.4 - 2}`;
  const mouthBody = `C ${a1}, ${a2}, ${p1} Q ${q} ${p2} C ${b1}, ${b2}, ${hw} ${c}`;
  const mouth = `M ${-hw} ${c} ${mouthBody}`;
  const mouthRev = `C ${b2}, ${b1}, ${p2} Q ${q} ${p1} C ${a2}, ${a1}, ${-hw} ${c}`;
  // lower lip: round factor pulls the widest point to the centre
  const r = s.roundLower;
  const bx = hw * (0.62 - 0.3 * r);
  const lowerBody = [
    `C ${hw * 0.9} ${c + s.lower * (0.35 + 0.25 * r)}, ${bx} ${s.lower}, 0 ${s.lower}`,
    `C ${-bx} ${s.lower}, ${-hw * 0.9} ${c + s.lower * (0.35 + 0.25 * r)}, ${-hw} ${c}`,
  ].join(' ');
  const lower = `M ${hw} ${c} ${lowerBody}`;
  const upperFill = `${upper} ${mouthRev} Z`;
  const lowerFill = `${mouth} ${lowerBody} Z`;
  return {upper, mouth, lower, upperFill, lowerFill};
};

export type Highlight = 'none' | 'upper' | 'lower' | 'border' | 'bow' | 'corners' | 'all';

export const Lips: React.FC<{
  shape: LipShape;
  size?: number;
  highlight?: Highlight;
  glow?: number; // 0..1 strength of the pink highlight
  draw?: number; // 0..1 line draw-on progress
  fillOpacity?: number;
  ghost?: LipShape; // faint dashed outline of the "before" lips
  lineColor?: string;
  neonColor?: string;
  fillFrom?: string;
  fillTo?: string;
  ghostColor?: string;
  strokeScale?: number;
}> = ({
  shape,
  size = 640,
  highlight = 'none',
  glow = 1,
  draw = 1,
  fillOpacity = 0.28,
  ghost,
  lineColor = '#fff',
  neonColor = '#FF6FB5',
  fillFrom = '#FF8CC6',
  fillTo = '#C23A86',
  ghostColor = 'rgba(255,255,255,0.45)',
  strokeScale = 1,
}) => {
  const uid = React.useId().replace(/:/g, '');
  const {upper, mouth, lower, upperFill, lowerFill} = paths(shape);
  const g = ghost ? paths(ghost) : null;
  const dash = 2000;
  const off = dash * (1 - draw);
  const line = {
    fill: 'none',
    stroke: lineColor,
    strokeWidth: 3.2 * strokeScale,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: dash,
    strokeDashoffset: off,
  };
  const neon = (on: boolean) => ({
    fill: 'none',
    stroke: neonColor,
    strokeWidth: 7 * strokeScale,
    strokeLinecap: 'round' as const,
    opacity: on ? glow : 0,
    filter: `url(#lipGlow${uid})`,
  });
  const hw = shape.width / 2;
  return (
    <svg viewBox="-300 -150 600 290" width={size} height={(size * 290) / 600} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`lipFill${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fillFrom} />
          <stop offset="1" stopColor={fillTo} />
        </linearGradient>
        <filter id={`lipGlow${uid}`} x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* soft fill */}
      <g opacity={fillOpacity * draw}>
        <path d={upperFill} fill={`url(#lipFill${uid})`} />
        <path d={lowerFill} fill={`url(#lipFill${uid})`} />
      </g>
      {/* neon highlight of the area this shape fills */}
      <path d={upper} {...neon(['upper', 'border', 'all'].includes(highlight))} />
      <path d={lower} {...neon(['lower', 'border', 'all'].includes(highlight))} />
      {highlight === 'bow' && (
        <path
          d={`M ${-shape.peak - 26} ${-shape.upper + 10} Q ${-shape.peak} ${-shape.upper - 4} ${-shape.peak * 0.4} ${-shape.upper + shape.bow * 0.6} Q 0 ${-shape.upper + shape.bow + 2} ${shape.peak * 0.4} ${-shape.upper + shape.bow * 0.6} Q ${shape.peak} ${-shape.upper - 4} ${shape.peak + 26} ${-shape.upper + 10}`}
          {...neon(true)}
          strokeWidth={9 * strokeScale}
        />
      )}
      {highlight === 'corners' && (
        <g opacity={glow} filter={`url(#lipGlow${uid})`} fill="none" stroke={neonColor} strokeWidth={6 * strokeScale} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${-hw - 30} ${shape.corner + 46} L ${-hw - 30} ${shape.corner - 6} M ${-hw - 44} ${shape.corner + 8} L ${-hw - 30} ${shape.corner - 8} L ${-hw - 16} ${shape.corner + 8}`} />
          <path d={`M ${hw + 30} ${shape.corner + 46} L ${hw + 30} ${shape.corner - 6} M ${hw + 16} ${shape.corner + 8} L ${hw + 30} ${shape.corner - 8} L ${hw + 44} ${shape.corner + 8}`} />
        </g>
      )}
      {g && (
        <g fill="none" stroke={ghostColor} strokeWidth={2.4 * strokeScale} strokeDasharray="7 9" strokeLinecap="round">
          <path d={g.upper} />
          <path d={g.lower} />
          {highlight === 'corners' && <path d={g.mouth} />}
        </g>
      )}
      {/* line art */}
      <path d={upper} {...line} />
      <path d={mouth} {...line} strokeWidth={2.6 * strokeScale} />
      <path d={lower} {...line} />
      {/* gloss */}
      <ellipse
        cx={-hw * 0.12}
        cy={shape.lower * 0.55}
        rx={hw * 0.16}
        ry={Math.max(4, shape.lower * 0.07)}
        fill="#fff"
        opacity={0.35 * draw}
      />
    </svg>
  );
};
