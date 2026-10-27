'use client';
/* oxlint-disable next/no-img-element, jsx-a11y/prefer-tag-over-role -- plain img elements
   on purpose (fetchPriority, lazy loading, explicit sizes, no optimisation endpoint
   in a static export); the stage is one composed picture with one label. */

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import {
  HERO_LOCATION,
  type PlateWeights,
  plateOpacities,
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

// Where the stack hangs and where the mobile is tied, in percent of the plate.
const SLING = { x: 79, top: 0, threadBottom: 24, width: 17.7 } as const;
const STACK_TOP = { x: 79, y: 37 } as const;
const KNOT = { x: 61, y: 17 } as const;
const DESK = { x: 70, y: 78 } as const;
const FIGURE = { x: 71, bottom: 93, width: 6.4 } as const;

// Trays: clock, calendar, envelope, ID card, folder. `t` is the second of the
// loop at which this tray's sheet leaves the stack; its flight takes 1.2 s.
const TRAYS = [
  { n: 1, x: 53, y: 46, w: 7.8, iw: 320, ih: 217, t: 2.0, tilt: -1 },
  { n: 2, x: 59, y: 39, w: 7.8, iw: 320, ih: 206, t: 2.9, tilt: 1 },
  { n: 3, x: 55, y: 57, w: 7.8, iw: 320, ih: 172, t: 3.8, tilt: -1 },
  { n: 4, x: 63, y: 51, w: 7.8, iw: 320, ih: 172, t: 4.7, tilt: 1 },
  { n: 5, x: 69, y: 43, w: 7.8, iw: 320, ih: 219, t: 5.6, tilt: -1 },
] as const;

const SHEETS = [
  { n: 1, w: 3.4, iw: 170, ih: 195, rot: -14 },
  { n: 2, w: 3.2, iw: 170, ih: 164, rot: 9 },
  { n: 3, w: 4.6, iw: 250, ih: 149, rot: -6 },
  { n: 4, w: 3.2, iw: 170, ih: 160, rot: 12 },
  { n: 5, w: 3.1, iw: 170, ih: 141, rot: -9 },
] as const;

const POSES = [
  { pose: 1, iw: 300, ih: 530 },
  { pose: 2, iw: 300, ih: 611 },
  { pose: 3, iw: 300, ih: 501 },
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

  const opacities = plateOpacities(weights);
  const plateStyle = {
    '--o-midday': loaded.midday ? opacities.midday : 0,
    '--o-afternoon': loaded.afternoon ? opacities.afternoon : 0,
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

      {/* The mobile: one thread from the ceiling to a knot, five arms to the trays. */}
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
              style={{ '--t': `${tray.t + 1.2}s` } as CSSProperties}
              x1={KNOT.x * 24}
              y1={KNOT.y * 13.55}
              x2={tray.x * 24}
              y2={(tray.y - heightPercent(tray.w, tray.iw, tray.ih) / 2) * 13.55}
            />
          ))}
          <circle
            className="hero-knot"
            cx={KNOT.x * 24}
            cy={KNOT.y * 13.55}
            r={7}
          />
        </svg>
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
                '--t': `${tray.t + 1.2}s`,
                '--tilt': tray.tilt,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* The stack in its sling, on its own thread, swaying from the ceiling. */}
      <div
        className="hero-sling"
        style={{
          left: `${SLING.x}%`,
          width: `${SLING.width}%`,
          '--thread': `${(SLING.threadBottom / 60) * 100}%`,
        } as CSSProperties}
      >
        <span className="hero-sling-thread" aria-hidden="true" />
        <img
          className="hero-sling-stack"
          src="/hero/sling.webp"
          width={680}
          height={768}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="hero-sling-tag">
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

      {/* Sheets peel off the stack into the trays, one every 0.9 s. */}
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
                left: `${STACK_TOP.x}%`,
                top: `${STACK_TOP.y}%`,
                width: `${sheet.w}%`,
                '--dx': tray.x - STACK_TOP.x,
                '--dy': tray.y - 2.5 - STACK_TOP.y,
                '--rot': `${sheet.rot}deg`,
                '--t': `${tray.t}s`,
              } as CSSProperties
            }
          />
        );
      })}

      {/* The slim folder drifts from the folder tray back down to the desk. */}
      <img
        className="hero-folder"
        src="/hero/sheet-6.webp"
        width={140}
        height={374}
        alt=""
        loading="lazy"
        decoding="async"
        style={
          {
            left: `${TRAYS[4].x}%`,
            top: `${TRAYS[4].y - 1}%`,
            width: '2.4%',
            '--dx': DESK.x - TRAYS[4].x,
            '--dy': DESK.y - (TRAYS[4].y - 1),
          } as CSSProperties
        }
      />

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
          />
        ))}
      </div>

      <div className="hero-grain" aria-hidden="true" />
    </div>
  );
}
