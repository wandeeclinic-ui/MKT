import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {Highlight, Lips, LipShape, mixShape, SHAPES} from './Lips';
import {Background, C, Caption, FONT, FPS, Header, Pill, rise, Tone, useEnter, useKanit} from './theme';

// ---------------------------------------------------------------------------
// Script. Each scene's VO is also its on-screen caption. Durations are
// placeholders until the voice-over is recorded; then they follow the audio.
// ---------------------------------------------------------------------------
type ShapeInfo = {
  key: keyof typeof SHAPES;
  th: string;
  en: string;
  point: string;
  fit: string;
  highlight: Highlight;
  vo: string;
};

export const SHAPE_INFO: ShapeInfo[] = [
  {
    key: 'natural',
    th: 'ทรงธรรมชาติ',
    en: 'Classy Kysse',
    point: 'ปากบนบางกว่าปากล่างเล็กน้อย',
    fit: 'อยากให้ทรงเดิมชัดขึ้น แบบเนียนๆ',
    highlight: 'all',
    vo: 'ทรงธรรมชาติ ปากบนบางกว่าปากล่างนิดหน่อย\nเหมาะกับคนที่อยากให้ทรงเดิมชัดขึ้น',
  },
  {
    key: 'cherry',
    th: 'ทรงกระจับ',
    en: 'Cherry Kysse',
    point: 'ปากล่างอวบกลมแบบเชอร์รี่',
    fit: 'สายน่ารัก อยากได้ติ่งกลางปากมีมิติ',
    highlight: 'lower',
    vo: 'ทรงกระจับ ปากล่างอวบแบบเชอร์รี่\nติ่งกลางปากบนมีมิติ ลุคน่ารัก',
  },
  {
    key: 'sexy',
    th: 'ทรงอวบอิ่ม',
    en: 'Sexy Kysse',
    point: 'บน : ล่าง ใกล้เคียง 1 : 1 ขอบปากคม',
    fit: 'อยากได้ปากอิ่ม ชัด มีมิติ',
    highlight: 'border',
    vo: 'ทรงอวบอิ่ม เติมบนกับล่างสัดส่วนใกล้เคียงกัน\nขอบปากคมชัด',
  },
  {
    key: 'cupid',
    th: 'ทรงมาสด้า',
    en: "Cupid's Bow",
    point: 'ขอบปากบนโค้งชัดเหมือนรูปหัวใจ',
    fit: 'อยากได้กระจับชัด โดยไม่ต้องผ่าตัด',
    highlight: 'bow',
    vo: 'ทรงมาสด้า เน้นขอบปากบน\nให้โค้งชัดเหมือนรูปหัวใจ',
  },
  {
    key: 'lifted',
    th: 'ทรงยกมุมปาก',
    en: 'Lip Corner Lift',
    point: 'เติมยกบริเวณมุมปาก',
    fit: 'มุมปากตก ดูเหมือนหน้าบึ้ง',
    highlight: 'corners',
    vo: 'ทรงยกมุมปาก สำหรับคนมุมปากตก\nช่วยให้หน้าดูสดใสขึ้น',
  },
];

export const SCENES: {id: string; dur: number; tone: Tone; vo: string}[] = [
  {id: 'hook', dur: 3.6, tone: 'dark', vo: 'เติมปากทรงไหน\nถึงจะเหมาะกับหน้าเรา?'},
  {id: 'what', dur: 5.4, tone: 'light', vo: 'ฟิลเลอร์ปาก คือ HA (ไฮยาลูรอนิก แอซิด)\nช่วยเติมเต็มและปรับรูปทรงริมฝีปาก'},
  ...SHAPE_INFO.map((s) => ({id: `shape-${s.key}`, dur: 5.4, tone: 'dark' as Tone, vo: s.vo})),
  {
    id: 'facts',
    dur: 8,
    tone: 'light',
    vo: 'ปริมาณขึ้นอยู่กับการประเมินของแพทย์ ส่วนใหญ่ราว 1–2 cc\nบวมราว 5–6 วัน อยู่ได้ประมาณ 6–18 เดือน',
  },
  {id: 'care', dur: 6, tone: 'dark', vo: 'หลังฉีด งดดูดหลอด งดของร้อน\nงดแอลกอฮอล์ และงดทาลิป 1 วันนะคะ'},
  {id: 'cta', dur: 6, tone: 'light', vo: 'ทรงไหนเหมาะกับหน้าเรา ให้คุณหมอช่วยประเมิน\nทักไลน์ @WandeeClinic ได้เลยค่ะ'},
];

export const sceneStarts = () => {
  let t = 0;
  return SCENES.map((s) => {
    const from = Math.round(t * FPS);
    t += s.dur;
    return {...s, from, frames: Math.round(s.dur * FPS)};
  });
};
export const TOTAL_FRAMES = Math.round(SCENES.reduce((a, s) => a + s.dur, 0) * FPS);

// ---------------------------------------------------------------------------
const Title: React.FC<{tone: Tone; top: number; size?: number; children: React.ReactNode; delay?: number}> = ({
  tone,
  top,
  size = 100,
  children,
  delay = 0,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.18,
        color: tone === 'dark' ? '#fff' : C.ink,
        whiteSpace: 'pre-line',
        ...rise(p, 50),
      }}
    >
      {children}
    </div>
  );
};

const Card: React.FC<{tone: Tone; top: number; height: number; children: React.ReactNode; delay?: number}> = ({
  tone,
  top,
  height,
  children,
  delay = 3,
}) => {
  const p = useEnter(delay, 18);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 90,
        right: 90,
        height,
        borderRadius: 44,
        background: tone === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.62)',
        border: tone === 'dark' ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(194,58,134,0.12)',
        boxShadow: tone === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.12)' : '0 24px 60px rgba(160,60,130,0.16)',
        opacity: p,
        transform: `scale(${0.94 + 0.06 * p})`,
      }}
    >
      {children}
    </div>
  );
};

// --- Scene 1: hook ---------------------------------------------------------
const ORDER: (keyof typeof SHAPES)[] = ['natural', 'cherry', 'sexy', 'cupid', 'lifted'];
const LABELS = ['ธรรมชาติ', 'กระจับ', 'อวบอิ่ม', 'มาสด้า', 'ยกมุมปาก'];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // cycle through the five shapes, ~0.55s each, morphing between them
  const step = 16;
  const i = Math.floor(frame / step) % ORDER.length;
  const t = Easing.inOut(Easing.cubic)(Math.min(1, (frame % step) / 8));
  const prev = ORDER[(i + ORDER.length - 1) % ORDER.length];
  const shape: LipShape = frame < step ? SHAPES[ORDER[0]] : mixShape(SHAPES[prev], SHAPES[ORDER[i]], t);
  const punch = interpolate(frame, [0, 12], [1.12, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const badge = useEnter(2, 14);
  return (
    <>
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', ...rise(badge, -20)}}>
        <Pill size={38}>ความรู้ 1 นาที · ฟิลเลอร์ปาก</Pill>
      </div>
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center', transform: `scale(${punch})`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 118, lineHeight: 1.12, color: '#fff'}}>
          ปากทรงไหน
          <br />
          <span style={{color: C.pinkSoft}}>เหมาะกับหน้าเรา?</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Lips shape={shape} size={820} highlight="all" glow={0.9} />
      </div>
      <div style={{position: 'absolute', top: 1170, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
        {LABELS.map((l, k) => (
          <div
            key={l}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 30,
              padding: '10px 20px 12px',
              borderRadius: 999,
              color: k === i ? '#fff' : 'rgba(255,255,255,0.55)',
              background: k === i ? 'linear-gradient(90deg, #E0479E, #9B4BE0)' : 'rgba(255,255,255,0.08)',
              transform: `scale(${k === i ? 1.08 : 1})`,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </>
  );
};

// --- Scene 2: what is it ---------------------------------------------------
const What: React.FC = () => {
  const frame = useCurrentFrame();
  const m = interpolate(frame, [36, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const drop = useEnter(10, 12);
  return (
    <>
      <Title tone="light" top={230} size={96}>
        ฟิลเลอร์ปาก
        <br />
        <span style={{color: C.magenta}}>คืออะไร?</span>
      </Title>
      <Card tone="light" top={540} height={720}>
        <div style={{position: 'absolute', top: 50, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26, alignItems: 'center'}}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50% 50% 50% 50% / 58% 58% 42% 42%',
              background: 'radial-gradient(circle at 35% 30%, #fff 0%, #FFC2E2 30%, #E0479E 100%)',
              boxShadow: '0 16px 40px rgba(224,71,158,0.35)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 52,
              color: '#fff',
              transform: `scale(${drop})`,
            }}
          >
            HA
          </div>
          <div style={{fontFamily: FONT, color: C.ink, ...rise(drop, 20)}}>
            <div style={{fontWeight: 700, fontSize: 46}}>Hyaluronic Acid</div>
            <div style={{fontWeight: 500, fontSize: 36, color: C.inkSoft}}>สารเติมเต็มที่อุ้มน้ำได้ดี</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{filter: 'drop-shadow(0 10px 18px rgba(120,20,80,0.25))'}}>
            <Lips shape={mixShape(SHAPES.before, SHAPES.natural, m)} size={600} highlight={m > 0.5 ? 'all' : 'none'} glow={m} fillOpacity={0.55} />
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 46, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 34, color: C.magenta}}>
          เติมเต็ม · ปรับรูปทรง · เพิ่มความชุ่มชื้น
        </div>
      </Card>
    </>
  );
};

// --- Scenes 3-7: the five shapes ---------------------------------------------
const ShapeScene: React.FC<{info: ShapeInfo; index: number}> = ({info, index}) => {
  const frame = useCurrentFrame();
  const m = interpolate(frame, [8, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const glow = interpolate(frame, [30, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const from = info.key === 'lifted' ? SHAPES.before : SHAPES.natural;
  const shape = info.key === 'natural' ? mixShape(SHAPES.before, SHAPES.natural, m) : mixShape(from, SHAPES[info.key], m);
  const chip = useEnter(0, 14);
  const rows = useEnter(16, 18);
  return (
    <>
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', ...rise(chip, -16)}}>
        <Pill tone="dark" filled={false} size={32}>
          ทรงที่ {index + 1} / 5
        </Pill>
      </div>
      <Title tone="dark" top={300} size={108} delay={2}>
        {info.th}
      </Title>
      <div
        style={{
          position: 'absolute',
          top: 440,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 46,
          letterSpacing: 1,
          color: C.pinkSoft,
          ...rise(useEnter(5), 30),
        }}
      >
        {info.en}
      </div>
      <Card tone="dark" top={560} height={500}>
        <div style={{position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Lips shape={shape} size={700} highlight={info.highlight} glow={glow} ghost={info.key === 'natural' ? SHAPES.before : from} />
        </div>
        <div style={{position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
          {SHAPE_INFO.map((s, k) => (
            <div
              key={s.key}
              style={{
                width: k === index ? 46 : 14,
                height: 14,
                borderRadius: 8,
                background: k === index ? C.pink : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </Card>
      <div style={{position: 'absolute', top: 1100, left: 110, right: 110, fontFamily: FONT, ...rise(rows, 24)}}>
        {[
          ['จุดเด่น', info.point],
          ['เหมาะกับ', info.fit],
        ].map(([k, v]) => (
          <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 22, marginBottom: 18}}>
            <div style={{flex: '0 0 170px', fontWeight: 600, fontSize: 34, color: C.pinkSoft}}>{k}</div>
            <div style={{fontWeight: 500, fontSize: 38, color: '#fff', lineHeight: 1.3}}>{v}</div>
          </div>
        ))}
      </div>
    </>
  );
};

// --- Scene 8: facts ----------------------------------------------------------
const Facts: React.FC = () => {
  const items = [
    {big: '1–2', unit: 'cc', label: 'ปริมาณที่ใช้ส่วนใหญ่', note: 'ขึ้นกับการประเมินของแพทย์'},
    {big: '5–6', unit: 'วัน', label: 'อาการบวม', note: 'เข้าที่ใน 1–2 สัปดาห์'},
    {big: '6–18', unit: 'เดือน', label: 'อยู่ได้ประมาณ', note: 'ขึ้นกับยี่ห้อและการดูแล'},
  ];
  return (
    <>
      <Title tone="light" top={230} size={92}>
        เติมแล้ว<span style={{color: C.magenta}}>ต้องรู้</span>
      </Title>
      <div style={{position: 'absolute', top: 420, left: 90, right: 90}}>
        {items.map((it, k) => (
          <FactRow key={it.label} {...it} delay={6 + k * 8} />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1255, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 28, color: C.inkSoft}}>
        *ผลลัพธ์และระยะเวลาขึ้นอยู่กับแต่ละบุคคล
      </div>
    </>
  );
};

const FactRow: React.FC<{big: string; unit: string; label: string; note: string; delay: number}> = ({big, unit, label, note, delay}) => {
  const p = useEnter(delay, 16);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 34,
        height: 250,
        marginBottom: 22,
        padding: '0 44px',
        borderRadius: 40,
        background: 'rgba(255,255,255,0.7)',
        boxShadow: '0 18px 44px rgba(160,60,130,0.14)',
        fontFamily: FONT,
        ...rise(p, 40),
      }}
    >
      <div style={{flex: '0 0 380px', color: C.magenta, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap'}}>
        <span style={{fontSize: 108}}>{big}</span>
        <span style={{fontSize: 46, marginLeft: 10}}>{unit}</span>
      </div>
      <div>
        <div style={{fontWeight: 600, fontSize: 44, color: C.ink}}>{label}</div>
        <div style={{fontWeight: 500, fontSize: 32, color: C.inkSoft, marginTop: 6}}>{note}</div>
      </div>
    </div>
  );
};

// --- Scene 9: aftercare --------------------------------------------------------
const ICONS: Record<string, React.ReactNode> = {
  straw: (
    <path d="M30 18 L46 6 M22 26 h28 l-4 34 h-20 z" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  ),
  hot: (
    <path
      d="M16 34 h30 v10 a12 12 0 0 1 -12 12 h-6 a12 12 0 0 1 -12 -12 z M46 38 h4 a6 6 0 0 1 0 12 h-4 M24 8 q-5 6 0 12 q5 6 0 12 M34 8 q-5 6 0 12 q5 6 0 12"
      fill="none"
      stroke="#fff"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  alcohol: (
    <path d="M18 8 h28 l-3 18 a11 11 0 0 1 -22 0 z M32 37 v17 M22 56 h20" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  ),
  lipstick: (
    <path d="M22 30 h20 v28 h-20 z M24 30 v-14 l14 -8 v22 M18 58 h28" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const Care: React.FC = () => {
  const items = [
    {icon: 'straw', t: 'งดดูดหลอด'},
    {icon: 'hot', t: 'งดของร้อน'},
    {icon: 'alcohol', t: 'งดแอลกอฮอล์'},
    {icon: 'lipstick', t: 'งดทาลิป 1 วัน'},
  ];
  return (
    <>
      <Title tone="dark" top={230} size={100}>
        ดูแล<span style={{color: C.pinkSoft}}>หลังฉีด</span>
      </Title>
      <div style={{position: 'absolute', top: 470, left: 90, right: 90, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
        {items.map((it, k) => (
          <CareTile key={it.t} {...it} delay={6 + k * 6} />
        ))}
      </div>
    </>
  );
};

const CareTile: React.FC<{icon: string; t: string; delay: number}> = ({icon, t, delay}) => {
  const p = useEnter(delay, 14);
  return (
    <div
      style={{
        height: 360,
        borderRadius: 40,
        background: 'linear-gradient(160deg, rgba(224,71,158,0.55), rgba(124,48,180,0.45))',
        border: '1px solid rgba(255,255,255,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        fontFamily: FONT,
        opacity: p,
        transform: `scale(${0.85 + 0.15 * p})`,
      }}
    >
      <div style={{width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center', position: 'relative'}}>
        <svg viewBox="0 0 64 64" width={80} height={80}>
          {ICONS[icon]}
        </svg>
        <svg viewBox="0 0 130 130" width={130} height={130} style={{position: 'absolute', inset: 0}}>
          <circle cx={65} cy={65} r={60} fill="none" stroke={C.pinkSoft} strokeWidth={5} />
          <line x1={23} y1={107} x2={107} y2={23} stroke={C.pinkSoft} strokeWidth={5} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{fontWeight: 600, fontSize: 42, color: '#fff'}}>{t}</div>
    </div>
  );
};

// --- Scene 10: CTA ------------------------------------------------------------
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.floor(frame / 20) % ORDER.length;
  const t = Easing.inOut(Easing.cubic)(Math.min(1, (frame % 20) / 10));
  const shape = mixShape(SHAPES[ORDER[(i + ORDER.length - 1) % ORDER.length]], SHAPES[ORDER[i]], t);
  const btn = useEnter(14, 12);
  return (
    <>
      <Title tone="light" top={230} size={92}>
        ทรงไหน<span style={{color: C.magenta}}>เหมาะกับเรา?</span>
      </Title>
      <div style={{position: 'absolute', top: 380, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 42, color: C.inkSoft}}>
        ให้คุณหมอช่วยประเมินรูปหน้าก่อนเติม
      </div>
      <Card tone="light" top={500} height={760}>
        <div style={{position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{filter: 'drop-shadow(0 10px 18px rgba(120,20,80,0.25))'}}>
            <Lips shape={shape} size={520} highlight="all" glow={0.7} fillOpacity={0.55} />
          </div>
        </div>
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
          <div style={{fontWeight: 700, fontSize: 92, letterSpacing: 4, color: C.magenta, lineHeight: 1}}>WANDEE</div>
          <div style={{fontWeight: 600, fontSize: 26, letterSpacing: 10, color: C.inkSoft, marginTop: 6}}>CLINIC</div>
          <div style={{marginTop: 34, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16}}>
            <div style={{background: '#06C755', color: '#fff', fontWeight: 700, fontSize: 28, padding: '8px 14px', borderRadius: 12}}>LINE</div>
            <div style={{fontWeight: 700, fontSize: 56, color: C.ink}}>@WandeeClinic</div>
          </div>
          <div style={{marginTop: 30, ...rise(btn, 20)}}>
            <Pill size={42}>ทักมาปรึกษา</Pill>
          </div>
        </div>
      </Card>
      <div style={{position: 'absolute', top: 1282, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 28, color: C.inkSoft}}>
        *ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
const SceneBody: React.FC<{id: string}> = ({id}) => {
  if (id === 'hook') return <Hook />;
  if (id === 'what') return <What />;
  if (id === 'facts') return <Facts />;
  if (id === 'care') return <Care />;
  if (id === 'cta') return <Cta />;
  const idx = SHAPE_INFO.findIndex((s) => `shape-${s.key}` === id);
  return <ShapeScene info={SHAPE_INFO[idx]} index={idx} />;
};

const Scene: React.FC<{id: string; tone: Tone; vo: string; startFrame: number}> = ({id, tone, vo, startFrame}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background tone={tone} />
      <Header tone={tone} progress={(startFrame + frame) / TOTAL_FRAMES} />
      <SceneBody id={id} />
      <Caption tone={tone} text={vo} />
    </AbsoluteFill>
  );
};

export const LipFiller: React.FC = () => {
  useKanit();
  return (
    <AbsoluteFill style={{backgroundColor: C.plum}}>
      {sceneStarts().map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
          <Scene id={s.id} tone={s.tone} vo={s.vo} startFrame={s.from} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
