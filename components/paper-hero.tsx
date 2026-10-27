'use client';
/* oxlint-disable next/no-img-element, jsx-a11y/prefer-tag-over-role -- plain img elements
   on purpose (fetchPriority, lazy loading, explicit sizes, no optimisation endpoint
   in a static export); the stage is one composed picture with one label. */

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import {
  dominantPlate,
  HERO_LOCATION,
  type PlateWeights,
  plateWeights,
} from '@/lib/sun';

// The paper-craft diorama from design/hero/README.md. Every sprite sits at a
// fixed point of the plate (percent of the stage); the stage keeps the plate's
// aspect ratio, so the scene scales as one picture. The thread, the knot and
// the mobile arms are drawn here, not in the images, so they can move. The
// loop itself is CSS (globals.css, `--hero-loop`); this file only places things.

export const HERO_LOOP_MS = 12000;
const PLATE = { width: 2400, height: 1355 } as const;
const SUN_REFRESH_MS = 5 * 60 * 1000;

// Anna is the mobile: one knot, her mark on it, a thread into every system.
// Where it is tied, in percent of the plate.
const KNOT = { x: 61, y: 17 } as const;
// Where the raised hand holds the coral card (measured on seated-2 at the
// figure's size below; the sprite's own card is cut out, this one is drawn).
const CARD = { x: 68.3, y: 61, width: 1.3 } as const;
// Where the returned folder lands: on the desk, between the mug and the chair.
const DESK = { x: 65.5, y: 78 } as const;
// An arm lights from the knot outward this long before its sheet moves, and
// a sheet's flight between a tray and the knot takes this long.
const ARM_LEAD = 0.5;
const FLIGHT = 1.0;
// The figure is placed by its chair back: `chairWidth` is the back's width in
// percent of the plate, `chairTop` where its top edge sits. Every pose is
// scaled and shifted to that, so the chair never moves or changes size.
const FIGURE = { x: 72, chairTop: 74.9, chairWidth: 4.83 } as const;

// Trays: clock, calendar, envelope, ID card, folder. Anna reads from the
// first three (a sheet rises from the tray into the knot) and writes to the
// last two (a sheet comes down from the knot into the tray). `t` is the
// second of the loop at which the sheet starts moving; the card reaches the
// knot at 2.0 s and the arm lights ARM_LEAD before each sheet.
const TRAYS = [
  { n: 1, x: 53, y: 46, w: 7.8, iw: 320, ih: 217, t: 2.7, tilt: -1, io: 'read' },
  { n: 2, x: 59, y: 39, w: 7.8, iw: 320, ih: 206, t: 3.6, tilt: 1, io: 'read' },
  { n: 3, x: 55, y: 57, w: 7.8, iw: 320, ih: 172, t: 4.5, tilt: -1, io: 'read' },
  { n: 4, x: 63, y: 51, w: 7.8, iw: 320, ih: 172, t: 5.4, tilt: 1, io: 'write' },
  { n: 5, x: 69, y: 43, w: 7.8, iw: 320, ih: 219, t: 6.3, tilt: -1, io: 'write' },
] as const;

// Sheets are small; a written sheet lands at the front-left lip of its tray,
// so the object in the tray (the system) stays visible.
const SHEETS = [
  { n: 1, w: 2.4, iw: 170, ih: 195, rot: -22 },
  { n: 2, w: 2.3, iw: 170, ih: 164, rot: 14 },
  { n: 3, w: 3.2, iw: 250, ih: 149, rot: -10 },
  { n: 4, w: 2.3, iw: 170, ih: 160, rot: 18 },
  { n: 5, w: 2.2, iw: 170, ih: 141, rot: -14 },
] as const;
const LANDING = { dx: -2.2, dy: 1.6 } as const;

// Measured on the full-resolution sprites (design/hero/source): the chair
// back's width, left edge and top edge in each sprite's own pixels. Poses 2
// and 3 were generated from pose 1 as reference; pose 2 was cropped at the
// bottom so the chair legs are the same length in all three.
const POSES = [
  { pose: 1, iw: 516, ih: 912, chair: { w: 274, left: 139, top: 317 } },
  { pose: 2, iw: 1182, ih: 2410, chair: { w: 610, left: 350, top: 1090 } },
  { pose: 3, iw: 1282, ih: 2376, chair: { w: 728, left: 315, top: 804 } },
] as const;

const PLATE_RATIO = PLATE.width / PLATE.height;
// Height of a sprite in percent of the stage height, from its width in percent
// of the stage width and its own pixel ratio.
const heightPercent = (w: number, iw: number, ih: number) =>
  w * PLATE_RATIO * (ih / iw);

const MORNING_ONLY: PlateWeights = { morning: 1, midday: 0, afternoon: 0 };

// Resolves after the browser has painted the first frame, so the extra plates
// and the sun maths never delay what the visitor sees first.
function afterFirstPaint(callback: () => void) {
  let cancelled = false;
  const run = () => {
    if (!cancelled) callback();
  };
  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  }).requestIdleCallback;
  const frame = window.requestAnimationFrame(() => {
    if (idle) idle(run, { timeout: 1500 });
    else window.setTimeout(run, 250);
  });
  return () => {
    cancelled = true;
    window.cancelAnimationFrame(frame);
  };
}

export function PaperHero({
  label,
  playing,
}: {
  label: string;
  playing: boolean;
}) {
  const [painted, setPainted] = useState(false);
  const [weights, setWeights] = useState<PlateWeights>(MORNING_ONLY);
  // A plate fades in only once it has arrived, never while still loading.
  const [loaded, setLoaded] = useState({ midday: false, afternoon: false });
  const markLoaded = (plate: 'midday' | 'afternoon') => () =>
    setLoaded((current) => ({ ...current, [plate]: true }));

  useEffect(() => afterFirstPaint(() => setPainted(true)), []);

  useEffect(() => {
    if (!painted) return;
    const update = () =>
      setWeights(
        plateWeights(
          new Date(),
          HERO_LOCATION.latitude,
          HERO_LOCATION.longitude,
        ),
      );
    update();
    const timer = window.setInterval(update, SUN_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [painted]);

  // One plate shows at a time: a blend would double-expose the desk and the
  // mug, which differ slightly between plates. The sun picks the plate and the
  // switch is a short cross-fade (globals.css).
  const plate = dominantPlate(weights);
  const plateStyle = {
    '--o-midday': plate !== 'morning' && loaded.midday ? 1 : 0,
    '--o-afternoon': plate === 'afternoon' && loaded.afternoon ? 1 : 0,
  } as CSSProperties;

  return (
    <div
      className="paper-hero-stage"
      data-playing={playing}
      role="img"
      aria-label={label}
    >
      <div className="hero-plates" style={plateStyle}>
        <img
          className="hero-plate"
          data-plate="morning"
          src="/hero/plate-morning.webp"
          width={PLATE.width}
          height={PLATE.height}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        {painted && (
          <img
            className="hero-plate"
            data-plate="midday"
            src="/hero/plate-midday.webp"
            width={PLATE.width}
            height={PLATE.height}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={markLoaded('midday')}
          />
        )}
        {painted && (
          <img
            className="hero-plate"
            data-plate="afternoon"
            src="/hero/plate-afternoon.webp"
            width={PLATE.width}
            height={PLATE.height}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={markLoaded('afternoon')}
          />
        )}
      </div>

      {/* The mobile is Anna: one thread from the ceiling to her knot, five arms
          to the trays. An arm pulses coral from the knot outward each time she
          reaches into a system. */}
      <div className="hero-mobile" style={{ transformOrigin: `${KNOT.x}% ${KNOT.y}%` }}>
        <svg
          className="hero-threads"
          viewBox={`0 0 ${PLATE.width} ${PLATE.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            className="hero-thread"
            x1={KNOT.x * 24}
            y1={0}
            x2={KNOT.x * 24}
            y2={KNOT.y * 13.55}
          />
          {TRAYS.map((tray) => (
            <line
              key={tray.n}
              className="hero-arm"
              x1={KNOT.x * 24}
              y1={KNOT.y * 13.55}
              x2={tray.x * 24}
              y2={(tray.y - heightPercent(tray.w, tray.iw, tray.ih) / 2) * 13.55}
            />
          ))}
          {TRAYS.map((tray) => (
            <line
              key={tray.n}
              className="hero-arm-pulse"
              pathLength={100}
              style={{ '--t': `${tray.t - ARM_LEAD}s` } as CSSProperties}
              x1={KNOT.x * 24}
              y1={KNOT.y * 13.55}
              x2={tray.x * 24}
              y2={(tray.y - heightPercent(tray.w, tray.iw, tray.ih) / 2) * 13.55}
            />
          ))}
        </svg>
        <div
          className="hero-knot"
          style={{ left: `${KNOT.x}%`, top: `${KNOT.y}%` }}
        >
          <img
            src="/brands/anna-mono-dark.svg"
            width={12}
            height={12}
            alt=""
            loading="lazy"
          />
        </div>
        {TRAYS.map((tray) => (
          <img
            key={tray.n}
            className="hero-tray"
            data-io={tray.io}
            src={`/hero/tray-${tray.n}.webp`}
            width={tray.iw}
            height={tray.ih}
            alt=""
            loading="lazy"
            decoding="async"
            style={
              {
                left: `${tray.x}%`,
                top: `${tray.y}%`,
                width: `${tray.w}%`,
                // Only a written-to tray settles, when its sheet lands.
                '--t': tray.io === 'write' ? `${tray.t + FLIGHT}s` : 'none',
                '--tilt': tray.tilt,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Sheets: a read rises from its tray into the knot, a write comes down
          from the knot and lands on the tray's lip. Both travel between the
          tray and the knot; the keyframes decide the direction. */}
      {SHEETS.map((sheet, index) => {
        const tray = TRAYS[index];
        const left = tray.x + (tray.io === 'write' ? LANDING.dx : 0);
        const top = tray.y + (tray.io === 'write' ? LANDING.dy : -1);
        return (
          <img
            key={sheet.n}
            className="hero-sheet"
            data-io={tray.io}
            src={`/hero/sheet-${sheet.n}.webp`}
            width={sheet.iw}
            height={sheet.ih}
            alt=""
            loading="lazy"
            decoding="async"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: `${sheet.w}%`,
                '--dx': KNOT.x - tray.x - (tray.io === 'write' ? LANDING.dx : 0),
                '--dy': KNOT.y - tray.y - (tray.io === 'write' ? LANDING.dy : -1),
                '--rot': `${sheet.rot}deg`,
                '--t': `${tray.t}s`,
              } as CSSProperties
            }
          />
        );
      })}

      {/* The slim folder, stamped with Anna's mark, comes down from the knot
          onto the desk: done, handed back. */}
      <div
        className="hero-folder"
        style={
          {
            left: `${KNOT.x}%`,
            top: `${KNOT.y}%`,
            width: '2.4%',
            '--dx': DESK.x - KNOT.x,
            '--dy': DESK.y - KNOT.y,
          } as CSSProperties
        }
      >
        <img
          src="/hero/sheet-6.webp"
          width={140}
          height={374}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <img
          className="hero-folder-mark"
          src="/brands/anna-mono-dark.svg"
          width={12}
          height={12}
          alt=""
          loading="lazy"
        />
      </div>

      {/* The figure on its chair, seen from behind: three poses, swapped like stop-motion. */}
      <div
        className="hero-figure"
        style={{
          left: `${FIGURE.x}%`,
          top: `${FIGURE.chairTop}%`,
          width: `${FIGURE.chairWidth}%`,
        }}
      >
        {POSES.map((pose) => (
          <img
            key={pose.pose}
            data-pose={pose.pose}
            src={`/hero/seated-${pose.pose}.webp`}
            width={pose.iw}
            height={pose.ih}
            alt=""
            loading={pose.pose === 2 ? 'eager' : 'lazy'}
            decoding="async"
            style={{
              width: `${(100 * pose.iw) / pose.chair.w}%`,
              left: `${(-100 * pose.chair.left) / pose.chair.w}%`,
              transform: `translateY(${(-100 * pose.chair.top) / pose.ih}%)`,
            }}
          />
        ))}
      </div>

      {/* The ask: the coral card, in the raised hand from the first frame,
          leaves it while the arm is still up and flies to the knot. */}
      <span
        className="hero-card"
        aria-hidden="true"
        style={
          {
            left: `${CARD.x}%`,
            top: `${CARD.y}%`,
            width: `${CARD.width}%`,
            '--dx': KNOT.x - CARD.x,
            '--dy': KNOT.y - CARD.y,
          } as CSSProperties
        }
      />

      <div className="hero-grain" aria-hidden="true" />
    </div>
  );
}
