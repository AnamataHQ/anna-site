'use client';

import { CalendarDays, Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { type CSSProperties, useEffect, useState } from 'react';

// The hero picture: one working day in a familiar calendar. Seven routine
// tasks leave the day and reappear, ticked, in Anna's list; the work that
// needs the person merges into one block. 10.4 s, played once in view.

export type DayTask = {
  readonly label: string;
  readonly time: string;
  readonly start: number;
  readonly duration: number;
  readonly incoming: boolean;
};

export type DayCopy = {
  readonly aria: string;
  readonly date: string;
  readonly view: string;
  readonly today: string;
  readonly weekday: string;
  readonly focus: string;
  readonly focusDetail: string;
  readonly handled: string;
  readonly handledCount: string;
  readonly before: string;
  readonly after: string;
  readonly tasks: readonly DayTask[];
};

type Language = 'en' | 'nl';

const CALENDAR_MERGE_DELAY_MS = 6800;
const CALENDAR_MERGE_DURATION_MS = 2900;
const INITIAL_FOCUS_WINDOW = { start: 715, end: 745 } as const;
const FINAL_FOCUS_WINDOW = { start: 480, end: 1020 } as const;
const DAY_MINUTES = 540;

// The work that needs the person: 380 minutes, which with the 160 minutes of
// routine tasks fills the nine-hour day.
const focusSegments = [
  {
    time: '08:00–09:00',
    start: 0,
    duration: 60,
    side: 'before',
    label: { en: 'Set priorities', nl: 'Prioriteiten bepalen' },
  },
  {
    time: '09:25–10:25',
    start: 85,
    duration: 60,
    side: 'before',
    label: { en: 'Review proposal', nl: 'Voorstel beoordelen' },
  },
  {
    time: '10:45–11:30',
    start: 165,
    duration: 45,
    side: 'before',
    label: { en: 'Make hiring decision', nl: 'Wervingsbesluit nemen' },
  },
  {
    time: '11:55–12:25',
    start: 235,
    duration: 30,
    side: 'anchor',
    label: { en: 'Team check-in', nl: 'Teamoverleg' },
  },
  {
    time: '12:55–13:40',
    start: 295,
    duration: 45,
    side: 'after',
    label: {
      en: 'Resolve project blocker',
      nl: 'Projectblokkade oplossen',
    },
  },
  {
    time: '14:00–15:00',
    start: 360,
    duration: 60,
    side: 'after',
    label: { en: 'Coach a colleague', nl: 'Collega coachen' },
  },
  {
    time: '15:20–16:10',
    start: 440,
    duration: 50,
    side: 'after',
    label: { en: 'Plan the roadmap', nl: 'Roadmap plannen' },
  },
  {
    time: '16:30–17:00',
    start: 510,
    duration: 30,
    side: 'after',
    label: { en: 'Strategy work', nl: 'Strategiewerk' },
  },
] as const;

const anchorSegment = focusSegments[3];

const formatCalendarTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const slot = (start: number, duration: number) =>
  ({
    '--event-start': `${(start / DAY_MINUTES) * 100}%`,
    '--event-duration': `${(duration / DAY_MINUTES) * 100}%`,
  }) as CSSProperties;

export function ClearedDay({
  copy,
  language,
  inView,
  reduceMotion,
}: {
  copy: DayCopy;
  language: Language;
  inView: boolean;
  reduceMotion: boolean;
}) {
  const [focusWindow, setFocusWindow] = useState<{
    start: number;
    end: number;
  }>(INITIAL_FOCUS_WINDOW);
  const focusTime = `${formatCalendarTime(focusWindow.start)}–${formatCalendarTime(focusWindow.end)}`;

  // The anchor's timeframe counts outward while the CSS expands the block.
  useEffect(() => {
    if (!inView) return;

    let animationFrame = 0;
    if (reduceMotion) {
      const resetTimer = window.setTimeout(
        () => setFocusWindow(FINAL_FOCUS_WINDOW),
        0,
      );
      return () => window.clearTimeout(resetTimer);
    }

    const resetTimer = window.setTimeout(
      () => setFocusWindow(INITIAL_FOCUS_WINDOW),
      0,
    );
    const mergeTimer = window.setTimeout(() => {
      const startedAt = window.performance.now();
      const updateFocusWindow = (now: number) => {
        const progress = Math.min(
          (now - startedAt) / CALENDAR_MERGE_DURATION_MS,
          1,
        );
        setFocusWindow({
          start: Math.round(
            INITIAL_FOCUS_WINDOW.start +
              (FINAL_FOCUS_WINDOW.start - INITIAL_FOCUS_WINDOW.start) *
                progress,
          ),
          end: Math.round(
            INITIAL_FOCUS_WINDOW.end +
              (FINAL_FOCUS_WINDOW.end - INITIAL_FOCUS_WINDOW.end) * progress,
          ),
        });
        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(updateFocusWindow);
        }
      };
      animationFrame = window.requestAnimationFrame(updateFocusWindow);
    }, CALENDAR_MERGE_DELAY_MS);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(mergeTimer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [inView, reduceMotion]);

  return (
    <figure className="cleared-day" aria-label={copy.aria}>
      <figcaption className="day-header">
        <div className="calendar-controls">
          <span className="today-chip">{copy.today}</span>
          <span className="calendar-chevrons" aria-hidden="true">
            ‹&nbsp;&nbsp;›
          </span>
          <span>
            <CalendarDays size={16} aria-hidden="true" /> {copy.date}
          </span>
        </div>
        <span className="calendar-view">{copy.view}</span>
      </figcaption>
      <div className="day-column-header">
        <span>{copy.weekday}</span>
        <i aria-hidden="true" />
      </div>
      <div className="day-body">
        <div className="time-rail" aria-hidden="true">
          {['08', '09', '10', '11', '12', '13', '14', '15', '16'].map(
            (hour) => (
              <span key={hour}>{hour}:00</span>
            ),
          )}
        </div>
        <div className="calendar-grid">
          <div className="focus-layer" aria-hidden="true">
            {focusSegments
              .filter((segment) => segment.side !== 'anchor')
              .map((segment) => (
                <div
                  className="focus-fragment"
                  data-side={segment.side}
                  key={segment.time}
                  style={slot(segment.start, segment.duration)}
                >
                  <small>{segment.time}</small>
                  <span>{segment.label[language]}</span>
                </div>
              ))}
          </div>
          <div className="events-layer" aria-hidden="true">
            {copy.tasks.map((task) => (
              <div
                className="calendar-event"
                key={task.label}
                data-incoming={task.incoming}
                style={slot(task.start, task.duration)}
              >
                <small>{task.time}</small>
                <span>{task.label}</span>
              </div>
            ))}
          </div>
          <div
            className="focus-block focus-anchor"
            style={slot(anchorSegment.start, anchorSegment.duration)}
          >
            <div className="anchor-compact" aria-hidden="true">
              <small>{focusTime}</small>
              <span>{anchorSegment.label[language]}</span>
            </div>
            <div className="anchor-expanded">
              <span className="focus-dot" aria-hidden="true" />
              <small className="anchor-time">{focusTime}</small>
              <strong>{copy.focus}</strong>
              <span className="anchor-detail">{copy.focusDetail}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="anna-tray calendar-summary">
        <span className="anna-tray-mark" aria-hidden="true">
          <Image
            src="/brands/anna-mono-dark.svg"
            alt=""
            width={32}
            height={32}
          />
        </span>
        <div>
          <small>{copy.handled}</small>
          <strong>
            <Check size={13} aria-hidden="true" />
            {copy.handledCount}
          </strong>
        </div>
        <ul className="handled-list" aria-hidden="true">
          {copy.tasks.map((task, index) => (
            <li
              className="handled-task"
              key={task.label}
              style={{ '--tick-order': index } as CSSProperties}
            >
              <Check size={11} aria-hidden="true" />
              {task.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="reduced-motion-story">
        <span>{copy.before}</span>
        <ChevronRight size={15} aria-hidden="true" />
        <strong>{copy.after}</strong>
      </div>
    </figure>
  );
}
