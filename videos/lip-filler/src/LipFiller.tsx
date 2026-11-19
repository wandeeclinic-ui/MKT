import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Highlight, Lips, mixShape, SHAPES} from './Lips';
import timing from '../../public/lipfiller/vo/timing.json';
import {B, Background, Caption, FONT, FPS, Header, ink, Logo, PhotoFrame, Pill, rise, Tone, useEnter, useKanit} from './theme';

// ---------------------------------------------------------------------------
// Script. Each scene's VO is also its on-screen caption. Durations are
// placeholders until the voice-over is recorded; then they follow the audio.
// Photos: real lip results cropped from wandeeclinic.com/ฟิลเลอร์-ปาก/
// (no doctor photos).
// ---------------------------------------------------------------------------
type ShapeInfo = {
  key: keyof typeof SHAPES;
  th: string;
  en: string;
  point: string;
  fit: string;
  highlight: Highlight;
  photo: string;
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
    photo: 'lipfiller/lip-natural.jpg',
    vo: 'ทรงธรรมชาติ ปากบนบางกว่าปากล่างนิดหน่อย\nเหมาะกับคนที่อยากให้ทรงเดิมชัดขึ้น',
  },
  {
    key: 'cherry',
    th: 'ทรงกระจับ',
    en: 'Cherry Lip',
    point: 'ปากล่างอวบกลมแบบเชอร์รี่',
    fit: 'สายน่ารัก อยากได้ติ่งกลางปากมีมิติ',
    highlight: 'lower',
    photo: 'lipfiller/lip-cherry.jpg',
    vo: 'ทรงกระจับ ปากล่างอวบแบบเชอร์รี่\nติ่งกลางปากบนมีมิติ ลุคน่ารัก',
  },
  {
    key: 'sexy',
    th: 'ทรงอวบอิ่ม',
    en: 'Sexy Kysse',
    point: 'บน : ล่าง ใกล้เคียง 1 : 1 ขอบปากคม',
    fit: 'อยากได้ปากอิ่ม ชัด มีมิติ',
    highlight: 'border',
    photo: 'lipfiller/lip-sexy.jpg',
    vo: 'ทรงอวบอิ่ม เติมบนกับล่างสัดส่วนใกล้เคียงกัน\nขอบปากคมชัด',
  },
  {
    key: 'cupid',
    th: 'ทรงมาสด้า',
    en: "Cupid's Bow",
    point: 'ขอบปากบนโค้งชัดเหมือนรูปหัวใจ',
    fit: 'อยากได้กระจับชัด โดยไม่ต้องผ่าตัด',
    highlight: 'bow',
    photo: 'lipfiller/lip-cupid.jpg',
    vo: 'ทรงมาสด้า เน้นขอบปากบน\nให้โค้งชัดเหมือนรูปหัวใจ',
  },
  {
    key: 'lifted',
    th: 'ทรงยกมุมปาก',
    en: 'Lip Corner Lift',
    point: 'เติมยกบริเวณมุมปาก',
    fit: 'มุมปากตก ดูเหมือนหน้าบึ้ง',
    highlight: 'corners',
    photo: 'lipfiller/lift-after.jpg',
    vo: 'ทรงยกมุมปาก สำหรับคนมุมปากตก\nช่วยให้หน้าดูสดใสขึ้น',
  },
];

const SCENE_DEFS: {id: string; dur: number; tone: Tone; vo: string}[] = [
  {id: 'hook', dur: 3.6, tone: 'pink', vo: 'เติมปากทรงไหน\nถึงจะเหมาะกับหน้าเรา?'},
  {id: 'what', dur: 5.4, tone: 'white', vo: 'ฟิลเลอร์ปาก คือ HA (ไฮยาลูรอนิก แอซิด)\nช่วยเติมเต็มและปรับรูปทรงริมฝีปาก'},
  ...SHAPE_INFO.map((s) => ({id: `shape-${s.key}`, dur: 5.4, tone: 'pink' as Tone, vo: s.vo})),
  {
    id: 'facts',
    dur: 8,
    tone: 'white',
    vo: 'ปริมาณขึ้นอยู่กับการประเมินของแพทย์ ส่วนใหญ่ราว 1–2 cc\nบวมราว 5–6 วัน อยู่ได้ประมาณ 6–18 เดือน',
  },
  {id: 'care', dur: 6, tone: 'black', vo: 'หลังฉีด งดดูดหลอด งดของร้อน\nงดแอลกอฮอล์ และงดทาลิป 1 วันนะคะ'},
  {id: 'cta', dur: 6, tone: 'pink', vo: 'ทรงไหนเหมาะกับหน้าเรา ให้คุณหมอช่วยประเมิน\nทักไลน์ @WandeeClinic ได้เลยค่ะ'},
];

// Scene length follows the recorded voice-over (public/lipfiller/vo/timing.json).
export const SCENES = SCENE_DEFS.map((s) => ({...s, dur: (timing as Record<string, {dur: number}>)[s.id]?.dur ?? s.dur}));

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
const Title: React.FC<{top: number; size?: number; children: React.ReactNode; delay?: number; color?: string}> = ({
  top,
  size = 100,
  children,
  delay = 0,
  color = B.black,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.16,
        color,
        whiteSpace: 'pre-line',
        ...rise(p, 50),
      }}
    >
      {children}
    </div>
  );
};

const PHOTO_W = 900;
const PHOTO_H = 530;

// --- Scene 1: hook ---------------------------------------------------------
const HOOK_SET = SHAPE_INFO.map((s) => ({photo: s.photo, label: s.th.replace('ทรง', '')}));

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const step = 15;
  const i = Math.floor(frame / step) % HOOK_SET.length;
  const local = frame % step;
  const zoom = interpolate(local, [0, 8], [1.12, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const punch = interpolate(frame, [0, 12], [1.12, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const badge = useEnter(2, 14);
  return (
    <>
      <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', ...rise(badge, -20)}}>
        <Pill variant="black" size={36}>
          ความรู้ 1 นาที · ฟิลเลอร์ปาก
        </Pill>
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', transform: `scale(${punch})`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 122, lineHeight: 1.1, color: B.black}}>
          ปากทรงไหน
          <br />
          <span style={{color: B.white}}>เหมาะกับหน้าเรา?</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 650, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <PhotoFrame src={HOOK_SET[i].photo} width={PHOTO_W} height={PHOTO_H} imgStyle={{transform: `scale(${zoom})`}} />
      </div>
      <div style={{position: 'absolute', top: 1210, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
        {HOOK_SET.map((s, k) => (
          <div
            key={s.label}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 31,
              padding: '10px 20px 12px',
              borderRadius: 999,
              color: k === i ? B.white : B.black,
              background: k === i ? B.black : 'rgba(255,255,255,0.55)',
            }}
          >
            {s.label}
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
  const card = useEnter(3, 18);
  return (
    <>
      <Title top={230} size={100}>
        ฟิลเลอร์ปาก
        <br />
        <span style={{color: B.hot}}>คืออะไร?</span>
      </Title>
      <div
        style={{
          position: 'absolute',
          top: 545,
          left: 90,
          right: 90,
          height: 720,
          borderRadius: 44,
          background: `linear-gradient(165deg, ${B.hot}, ${B.pink} 55%, ${B.soft})`,
          boxShadow: '0 24px 60px rgba(239,59,139,0.3)',
          opacity: card,
          transform: `scale(${0.94 + 0.06 * card})`,
        }}
      >
        <div style={{position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28, alignItems: 'center'}}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: B.white,
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 56,
              color: B.hot,
              boxShadow: '0 14px 34px rgba(123,3,46,0.25)',
              transform: `scale(${drop})`,
            }}
          >
            HA
          </div>
          <div style={{fontFamily: FONT, color: B.white, ...rise(drop, 20)}}>
            <div style={{fontWeight: 700, fontSize: 48}}>Hyaluronic Acid</div>
            <div style={{fontWeight: 500, fontSize: 36, color: B.black}}>สารเติมเต็มที่อุ้มน้ำได้ดี</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Lips
            shape={mixShape(SHAPES.before, SHAPES.natural, m)}
            ghost={SHAPES.before}
            size={620}
            highlight={m > 0.5 ? 'all' : 'none'}
            glow={m}
            lineColor={B.white}
            neonColor={B.white}
            fillFrom="#ffffff"
            fillTo={B.peach}
            fillOpacity={0.55}
            ghostColor="rgba(0,0,0,0.35)"
          />
        </div>
        <div style={{position: 'absolute', bottom: 48, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
          {['เติมเต็ม', 'ปรับรูปทรง', 'เพิ่มความชุ่มชื้น'].map((t) => (
            <Pill key={t} variant="white" size={32}>
              {t}
            </Pill>
          ))}
        </div>
      </div>
    </>
  );
};

// --- Scenes 3-7: the five shapes ---------------------------------------------
const ShapeBadge: React.FC<{info: ShapeInfo}> = ({info}) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [22, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = useEnter(14, 13);
  return (
    <div
      style={{
        position: 'absolute',
        right: -20,
        bottom: -34,
        width: 250,
        height: 250,
        borderRadius: '50%',
        background: B.black,
        border: `8px solid ${B.white}`,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 18px 40px rgba(60,0,30,0.35)',
        transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`,
      }}
    >
      <Lips
        shape={SHAPES[info.key]}
        ghost={info.key === 'lifted' ? SHAPES.before : undefined}
        size={200}
        highlight={info.highlight}
        glow={glow}
        lineColor={B.white}
        neonColor={B.hot}
        fillFrom={B.soft}
        fillTo={B.hot}
        fillOpacity={0.35}
        strokeScale={1.8}
      />
    </div>
  );
};

const ShapeScene: React.FC<{info: ShapeInfo; index: number}> = ({info, index}) => {
  const frame = useCurrentFrame();
  const chip = useEnter(0, 14);
  const card = useEnter(3, 18);
  const rows = useEnter(16, 18);
  const kb = interpolate(frame, [0, 160], [1.08, 1], {extrapolateRight: 'clamp'}); // slow push on the photo
  const lift = info.key === 'lifted';
  return (
    <>
      <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', ...rise(chip, -16)}}>
        <Pill variant="outline-black" size={32}>
          ทรงที่ {index + 1} / 5
        </Pill>
      </div>
      <Title top={290} size={112} delay={2}>
        {info.th}
      </Title>
      <div
        style={{
          position: 'absolute',
          top: 432,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 46,
          letterSpacing: 1,
          color: B.white,
          ...rise(useEnter(5), 30),
        }}
      >
        {info.en}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 530,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: card,
          transform: `translateY(${(1 - card) * 40}px)`,
        }}
      >
        {lift ? (
          <div style={{position: 'relative', width: PHOTO_W, height: PHOTO_H, display: 'flex', gap: 12}}>
            {(['before', 'after'] as const).map((k) => (
              <PhotoFrame key={k} src={`lipfiller/lift-${k}.jpg`} width={(PHOTO_W - 12) / 2} height={PHOTO_H} radius={36} border={12}>
                <div style={{position: 'absolute', top: 26, left: 26}}>
                  <Pill variant={k === 'after' ? 'pink' : 'black'} size={30}>
                    {k === 'before' ? 'ก่อน' : 'หลัง'}
                  </Pill>
                </div>
              </PhotoFrame>
            ))}
            <ShapeBadge info={info} />
          </div>
        ) : (
          <PhotoFrame src={info.photo} width={PHOTO_W} height={PHOTO_H} imgStyle={{transform: `scale(${kb})`}}>
            <ShapeBadge info={info} />
          </PhotoFrame>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1118,
          left: 90,
          right: 90,
          padding: '28px 36px 18px',
          borderRadius: 32,
          background: 'rgba(255,255,255,0.92)',
          fontFamily: FONT,
          ...rise(rows, 24),
        }}
      >
        {[
          ['จุดเด่น', info.point],
          ['เหมาะกับ', info.fit],
        ].map(([k, v]) => (
          <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 12}}>
            <div style={{flex: '0 0 150px', fontWeight: 700, fontSize: 34, color: B.hot}}>{k}</div>
            <div style={{fontWeight: 500, fontSize: 36, color: B.black, lineHeight: 1.3}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1305, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
        {SHAPE_INFO.map((s, k) => (
          <div key={s.key} style={{width: k === index ? 46 : 14, height: 14, borderRadius: 8, background: k === index ? B.black : 'rgba(255,255,255,0.6)'}} />
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
      <Title top={230} size={96}>
        เติมแล้ว<span style={{color: B.hot}}>ต้องรู้</span>
      </Title>
      <div style={{position: 'absolute', top: 410, left: 90, right: 90}}>
        {items.map((it, k) => (
          <FactRow key={it.label} {...it} delay={6 + k * 8} />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1270, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 28, color: 'rgba(0,0,0,0.6)'}}>
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
        gap: 30,
        height: 252,
        marginBottom: 22,
        padding: '0 44px',
        borderRadius: 40,
        background: `linear-gradient(120deg, ${B.hot}, ${B.soft})`,
        boxShadow: '0 18px 44px rgba(239,59,139,0.25)',
        fontFamily: FONT,
        ...rise(p, 40),
      }}
    >
      <div style={{flex: '0 0 380px', color: B.white, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap'}}>
        <span style={{fontSize: 112}}>{big}</span>
        <span style={{fontSize: 46, marginLeft: 10}}>{unit}</span>
      </div>
      <div>
        <div style={{fontWeight: 600, fontSize: 44, color: B.black}}>{label}</div>
        <div style={{fontWeight: 500, fontSize: 32, color: B.white, marginTop: 6}}>{note}</div>
      </div>
    </div>
  );
};

// --- Scene 9: aftercare --------------------------------------------------------
const ICONS: Record<string, React.ReactNode> = {
  straw: <path d="M30 18 L46 6 M22 26 h28 l-4 34 h-20 z" />,
  hot: (
    <path d="M16 34 h30 v10 a12 12 0 0 1 -12 12 h-6 a12 12 0 0 1 -12 -12 z M46 38 h4 a6 6 0 0 1 0 12 h-4 M24 8 q-5 6 0 12 q5 6 0 12 M34 8 q-5 6 0 12 q5 6 0 12" />
  ),
  alcohol: <path d="M18 8 h28 l-3 18 a11 11 0 0 1 -22 0 z M32 37 v17 M22 56 h20" />,
  lipstick: <path d="M22 30 h20 v28 h-20 z M24 30 v-14 l14 -8 v22 M18 58 h28" />,
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
      <Title top={230} size={104} color={B.white}>
        ดูแล<span style={{color: B.pink}}>หลังฉีด</span>
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
        background: `linear-gradient(160deg, ${B.hot}, ${B.soft})`,
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
      <div style={{width: 136, height: 136, borderRadius: '50%', background: B.white, display: 'grid', placeItems: 'center', position: 'relative'}}>
        <svg viewBox="0 0 64 64" width={78} height={78}>
          <g fill="none" stroke={B.black} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            {ICONS[icon]}
          </g>
        </svg>
        <svg viewBox="0 0 136 136" width={136} height={136} style={{position: 'absolute', inset: 0}}>
          <circle cx={68} cy={68} r={62} fill="none" stroke={B.wine} strokeWidth={6} />
          <line x1={24} y1={112} x2={112} y2={24} stroke={B.wine} strokeWidth={6} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{fontWeight: 700, fontSize: 44, color: B.white}}>{t}</div>
    </div>
  );
};

// --- Scene 10: CTA ------------------------------------------------------------
const Cta: React.FC = () => {
  const btn = useEnter(14, 12);
  const card = useEnter(3, 18);
  const photos = SHAPE_INFO.slice(0, 4).map((s) => s.photo);
  return (
    <>
      <Title top={225} size={96}>
        ทรงไหน<span style={{color: B.white}}>เหมาะกับเรา?</span>
      </Title>
      <div style={{position: 'absolute', top: 370, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 42, color: B.black}}>
        ให้คุณหมอช่วยประเมินรูปหน้าก่อนเติม
      </div>
      <div
        style={{
          position: 'absolute',
          top: 490,
          left: 90,
          right: 90,
          height: 770,
          borderRadius: 44,
          background: B.white,
          boxShadow: '0 24px 60px rgba(90,0,40,0.25)',
          opacity: card,
          transform: `scale(${0.94 + 0.06 * card})`,
        }}
      >
        <div style={{position: 'absolute', top: 36, left: 36, right: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
          {photos.map((p) => (
            <div key={p} style={{height: 168, borderRadius: 24, overflow: 'hidden'}}>
              <Img src={staticFile(p)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', top: 440, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT}}>
          <Logo tone="white" height={92} />
          <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{background: '#06C755', color: '#fff', fontWeight: 700, fontSize: 28, padding: '8px 14px', borderRadius: 12}}>LINE</div>
            <div style={{fontWeight: 700, fontSize: 56, color: B.black}}>@WandeeClinic</div>
          </div>
          <div style={{marginTop: 28, ...rise(btn, 20)}}>
            <Pill variant="pink" size={42}>
              ทักมาปรึกษา
            </Pill>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1282, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 28, color: B.black}}>
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

// Quick punch-in on every cut (the hook has its own).
const SceneIn: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const frame = useCurrentFrame();
  if (first) return <>{children}</>;
  const p = interpolate(frame, [0, 7], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{opacity: 0.4 + 0.6 * p, transform: `scale(${1.05 - 0.05 * p})`}}>{children}</AbsoluteFill>;
};

const Scene: React.FC<{id: string; tone: Tone; vo: string; startFrame: number}> = ({id, tone, vo, startFrame}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{color: ink(tone)}}>
      <Background tone={tone} />
      <Header tone={tone} progress={(startFrame + frame) / TOTAL_FRAMES} />
      <SceneIn first={startFrame === 0}>
        <SceneBody id={id} />
      </SceneIn>
      <Caption tone={tone} text={vo} />
    </AbsoluteFill>
  );
};

export const LipFiller: React.FC = () => {
  useKanit();
  return (
    <AbsoluteFill style={{backgroundColor: B.pink}}>
      {sceneStarts().map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
          <Scene id={s.id} tone={s.tone} vo={s.vo} startFrame={s.from} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
