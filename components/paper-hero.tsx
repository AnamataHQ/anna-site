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

// The work is on the visitor's desk: a paper stack at the left end of the
// desk (its top surface is at 79-80 % of the plate), the mug stays visible to
// its right. `top` is where the sheets leave; `bottom` sits on the desk.
const STACK = { x: 62.4, top: 74.4, bottom: 80.2, width: 4.6, iw: 300, ih: 231 } as const;
// Anna is the mobile: one knot, her mark on it, a thread into every system.
// Where it is tied, in percent of the plate.
const KNOT = { x: 61, y: 17 } as const;
// Where the raised coral card sits in the card-up pose (measured on the
// sprite at the figure's size below); the card flies from here to the knot.
const CARD = { x: 74.6, y: 55.8, width: 1.5 } as const;
// An arm lights from the knot outward this long before its sheet lifts, and
// a sheet's flight to its tray takes this long.
const ARM_LEAD = 0.6;
const FLIGHT = 1.2;
// `width` is the chair's footprint (its legs); each pose scales to that, so the
// chair stays the same size while the figure changes pose. A real chair is
// about a third of the desk (which spans 61-76 % of the plate).
const FIGURE = { x: 72, bottom: 93.5, width: 6.2 } as const;

// Trays: clock, calendar, envelope, ID card, folder. `t` is the second of the
// loop at which this tray's sheet leaves the stack (the card reaches the knot
// at 2.0 s; the arm lights ARM_LEAD earlier; the flight takes FLIGHT).
const TRAYS = [
  { n: 1, x: 53, y: 46, w: 7.8, iw: 320, ih: 217, t: 2.6, tilt: -1 },
  { n: 2, x: 59, y: 39, w: 7.8, iw: 320, ih: 206, t: 3.5, tilt: 1 },
  { n: 3, x: 55, y: 57, w: 7.8, iw: 320, ih: 172, t: 4.4, tilt: -1 },
  { n: 4, x: 63, y: 51, w: 7.8, iw: 320, ih: 172, t: 5.3, tilt: 1 },
  { n: 5, x: 69, y: 43, w: 7.8, iw: 320, ih: 219, t: 6.2, tilt: -1 },
] as const;

// Sheets are small and land at the front-left lip of their tray, so the
// object in the tray (the system) stays visible.
const SHEETS = [
  { n: 1, w: 2.4, iw: 170, ih: 195, rot: -22 },
  { n: 2, w: 2.3, iw: 170, ih: 164, rot: 14 },
  { n: 3, w: 3.2, iw: 250, ih: 149, rot: -10 },
  { n: 4, w: 2.3, iw: 170, ih: 160, rot: 18 },
  { n: 5, w: 2.2, iw: 170, ih: 141, rot: -14 },
] as const;
const LANDING = { dx: -2.2, dy: 1.6 } as const;

// Measured on the full-resolution sprites (design/hero/source): the chair
// legs' span and left edge, so every pose is scaled and shifted to the same
// chair footprint. Poses 2 and 3 were generated from pose 1 as reference, so
// the figure itself is the same size in all three.
const POSES = [
  { pose: 1, iw: 360, ih: 636, legs: 352, legsLeft: 81, native: 516 },
  { pose: 2, iw: 360, ih: 785, legs: 699, legsLeft: 281, native: 1182 },
  { pose: 3, iw: 360, ih: 667, legs: 870, legsLeft: 190, native: 1282 },
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
  tag,
  playing,
}: {
  label: string;
  tag: string;
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
                '--t': `${tray.t + FLIGHT}s`,
                '--tilt': tray.tilt,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* The stack of work on the desk, tagged for Anna; it thins as sheets leave. */}
      <div
        className="hero-stack"
        style={{
          left: `${STACK.x}%`,
          top: `${STACK.bottom}%`,
          width: `${STACK.width}%`,
        }}
      >
        <img
          className="hero-stack-paper"
          src="/hero/stack.webp"
          width={STACK.iw}
          height={STACK.ih}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="hero-stack-tag">
          <img
            src="/brands/anna-mono-dark.svg"
            width={12}
            height={12}
            alt=""
            loading="lazy"
          />
          {tag}
        </span>
      </div>

      {/* Sheets lift off the stack into the trays, one every 0.9 s. */}
      {SHEETS.map((sheet, index) => {
        const tray = TRAYS[index];
        return (
          <img
            key={sheet.n}
            className="hero-sheet"
            src={`/hero/sheet-${sheet.n}.webp`}
            width={sheet.iw}
            height={sheet.ih}
            alt=""
            loading="lazy"
            decoding="async"
            style={
              {
                left: `${STACK.x}%`,
                top: `${STACK.top}%`,
                width: `${sheet.w}%`,
                '--dx': tray.x + LANDING.dx - STACK.x,
                '--dy': tray.y + LANDING.dy - STACK.top,
                '--rot': `${sheet.rot}deg`,
                '--t': `${tray.t}s`,
              } as CSSProperties
            }
          />
        );
      })}

      {/* The slim folder, stamped with Anna's mark, comes down from the knot
          onto the stack: done, handed back. */}
      <div
        className="hero-folder"
        style={
          {
            left: `${KNOT.x}%`,
            top: `${KNOT.y}%`,
            width: '2.4%',
            '--dx': STACK.x - KNOT.x,
            '--dy': STACK.top - 1.2 - KNOT.y,
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
          top: `${FIGURE.bottom}%`,
          width: `${FIGURE.width}%`,
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
              width: `${(100 * pose.native) / pose.legs}%`,
              left: `${(-100 * pose.legsLeft) / pose.legs}%`,
            }}
          />
        ))}
      </div>

      {/* The ask: the coral card leaves the raised hand and flies to the knot. */}
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
