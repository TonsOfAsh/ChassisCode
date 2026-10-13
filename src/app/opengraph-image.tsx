import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * The picture shown when a ChassisCode link is shared (iMessage, Discord,
 * Reddit, X...). Drawn as the game's chassis data plate, with sample rows
 * whose values stay hidden, so it never gives away a puzzle. Built once at
 * build time.
 */

export const alt = 'ChassisCode: name the exact car from its spec sheet, one clue at a time.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = {
  primer: '#e4e6e3',
  aluminium: '#d2d6d7',
  edge: '#9aa2a5',
  line: '#b6bcbe',
  ink: '#15191c',
  soft: '#4d565b',
  marker: '#f2c200',
  right: '#1b6b43',
};

const font = (file: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', file));

const ROWS: { label: string; value: string; state: 'shown' | 'new' | 'hidden' }[] = [
  { label: 'Country', value: 'Japan', state: 'shown' },
  { label: 'Engine', value: 'Inline-6', state: 'shown' },
  { label: 'Drivetrain', value: 'AWD', state: 'new' },
  { label: 'Power', value: '', state: 'hidden' },
  { label: 'Weight', value: '', state: 'hidden' },
  { label: 'Generation', value: '', state: 'hidden' },
];

function Rivet({ top, left }: { top: number; left: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: 18,
        height: 18,
        borderRadius: 9,
        background: '#aab1b4',
        border: `3px solid ${C.ink}`,
      }}
    />
  );
}

export default async function Image() {
  const [stamp, stampSemi, text] = await Promise.all([
    font('barlow-condensed/files/barlow-condensed-latin-700-normal.woff'),
    font('barlow-condensed/files/barlow-condensed-latin-600-normal.woff'),
    font('barlow/files/barlow-latin-500-normal.woff'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: C.primer,
          padding: '0 72px',
          gap: 64,
          fontFamily: 'Barlow',
          color: C.ink,
        }}
      >
        {/* Left: name and pitch */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 500 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: -1 }}>
            ChassisCode
          </div>
          <div style={{ width: 120, height: 14, background: C.marker, marginTop: 22, marginBottom: 30 }} />
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 38, lineHeight: 1.25, color: C.ink }}>
            <div>Name the exact car</div>
            <div>from its spec sheet,</div>
            <div>one clue at a time.</div>
          </div>
          <div style={{ fontSize: 28, marginTop: 26, color: C.soft }}>A new car every day · chassiscode.app</div>
        </div>

        {/* Right: the data plate */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: 520,
            padding: '44px 52px',
            background: C.aluminium,
            border: `4px solid ${C.ink}`,
            borderRadius: 18,
            boxShadow: `0 0 0 10px ${C.edge}`,
          }}
        >
          <Rivet top={14} left={14} />
          <Rivet top={14} left={480} />
          <Rivet top={448} left={14} />
          <Rivet top={448} left={480} />
          <div
            style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: 4,
              color: C.soft,
              marginBottom: 14,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            MYSTERY CAR
          </div>
          {ROWS.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 58,
                borderTop: `2px solid ${C.line}`,
                fontFamily: 'Barlow Condensed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 28, color: C.soft }}>
                {row.state === 'new' && <div style={{ width: 14, height: 14, borderRadius: 7, background: C.marker, marginRight: 10 }} />}
                {row.label}
              </div>
              {row.state === 'hidden' ? (
                <div style={{ width: 150, height: 26, borderRadius: 4, background: C.edge }} />
              ) : (
                <div style={{ fontWeight: 700, fontSize: 34, color: row.state === 'new' ? C.right : C.ink }}>{row.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Barlow Condensed', data: stamp, weight: 700, style: 'normal' },
        { name: 'Barlow Condensed', data: stampSemi, weight: 600, style: 'normal' },
        { name: 'Barlow', data: text, weight: 500, style: 'normal' },
      ],
    },
  );
}
