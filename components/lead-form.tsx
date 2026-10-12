'use client';

import { X } from 'lucide-react';
import { type SyntheticEvent, useEffect, useId, useRef, useState } from 'react';

import {
  buildPayload,
  createOpenings,
  type LeadKind,
  type LeadLanguage,
  rememberFirstSource,
  submitLead,
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_TEST_SITE_KEY,
  waitForToken,
} from '@/lib/lead-capture';

// Inlined at build time; the deploy workflow passes the real (public) site key.
const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;

// Where the privacy statement (Taiga #418) is published.
const PRIVACY_URL = 'https://anamata.ai/privacy';

// Approved form text (Taiga #344, 2026-10-07). Change only with approval.
const TEXT = {
  en: {
    heading: { demo: 'Book a demo', contact: 'Contact Anamata' },
    name: 'Name',
    email: 'Work email',
    org: 'Organisation',
    message: 'Message (optional)',
    submit: 'Send request',
    privacy: 'We use your details only to answer this request.',
    privacyLink: 'Read our privacy statement.',
    success: "Thanks, your request has reached us. We'll reply by email.",
    failure: "Sending didn't work. Email us directly at",
    close: 'Close',
  },
  nl: {
    heading: { demo: 'Plan een demo', contact: 'Neem contact op' },
    name: 'Naam',
    email: 'Zakelijk e-mailadres',
    org: 'Organisatie',
    message: 'Bericht (optioneel)',
    submit: 'Verstuur aanvraag',
    privacy:
      'We gebruiken je gegevens alleen om deze aanvraag te beantwoorden.',
    privacyLink: 'Lees onze privacyverklaring.',
    success: 'Bedankt, je aanvraag is binnen. We reageren per mail.',
    failure: 'Versturen lukte niet. Mail ons direct via',
    close: 'Sluiten',
  },
} as const;

type Turnstile = {
  render: (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let turnstileScript: Promise<Turnstile> | null = null;

// Adds Cloudflare's script on first use only; an ordinary visit never loads it.
function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileScript ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error('Turnstile missing'));
    script.onerror = () => {
      turnstileScript = null;
      script.remove();
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return turnstileScript;
}

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// Remembers how the visitor arrived; call once when the page loads.
export function captureLandingSource() {
  return rememberFirstSource(sessionStore(), window.location, document.referrer);
}

type Status = 'idle' | 'sending' | 'success' | 'failure';

export function LeadFormDialog({
  kind,
  language,
  onClose,
}: {
  kind: LeadKind | null;
  language: LeadLanguage;
  onClose: () => void;
}) {
  const id = useId();
  const t = TEXT[language];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef('');
  const openedAtRef = useRef(0);
  const openingsRef = useRef(createOpenings());
  const openingRef = useRef(0);
  const [status, setStatus] = useState<Status>('idle');
  // The kind stays visible while the dialog animates closed.
  const [shownKind, setShownKind] = useState<LeadKind>('demo');

  // Opening: show the dialog and start the fill timer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !kind) return;
    setShownKind(kind);
    setStatus('idle');
    openingRef.current = openingsRef.current.next();
    openedAtRef.current = performance.now();
    if (!dialog.open) dialog.showModal();
  }, [kind]);

  // The Turnstile widget lives while the dialog is open, in the page language.
  useEffect(() => {
    if (!kind) return;
    tokenRef.current = '';
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !widgetRef.current) return;
        widgetIdRef.current = turnstile.render(widgetRef.current, {
          sitekey: SITE_KEY,
          action: 'lead',
          language,
          theme: 'light',
          // 'flexible' needs at least 300px; narrow phones get the compact widget.
          size: widgetRef.current.clientWidth >= 300 ? 'flexible' : 'compact',
          callback: (token: string) => {
            tokenRef.current = token;
          },
          'expired-callback': () => {
            tokenRef.current = '';
          },
          'error-callback': () => {
            tokenRef.current = '';
          },
        });
      })
      .catch(() => {
        // No widget means no token; submitting then shows the mail fallback.
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = undefined;
    };
  }, [kind, language]);

  function close() {
    dialogRef.current?.close();
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending' || !kind) return;
    const opening = openingRef.current;
    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value : '';
    };
    setStatus('sending');

    const token = await waitForToken(() => tokenRef.current);
    // Closed while waiting: do not send, and never take a later opening's token.
    if (!openingsRef.current.isCurrent(opening)) return;
    const outcome = token
      ? await submitLead(
          buildPayload({
            kind,
            lang: language,
            fields: {
              name: field('name'),
              email: field('email'),
              org: field('org'),
              message: field('message'),
            },
            source: captureLandingSource(),
            turnstileToken: token,
            honeypot: field('website'),
            elapsedMs: performance.now() - openedAtRef.current,
          }),
        )
      : 'failure';

    // Closed or reopened while sending: this result belongs to an old form.
    if (!openingsRef.current.isCurrent(opening)) return;

    // A Turnstile token is single-use: get a fresh one for a retry, or drop
    // the widget before the success text replaces the form.
    tokenRef.current = '';
    if (widgetIdRef.current && window.turnstile) {
      if (outcome === 'failure') {
        window.turnstile.reset(widgetIdRef.current);
      } else {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    }
    setStatus(outcome);
  }

  const headingId = `${id}-heading`;

  return (
    <dialog
      ref={dialogRef}
      className="lead-dialog"
      aria-labelledby={headingId}
      onClose={() => {
        openingsRef.current.close();
        onClose();
      }}
    >
      <div className="lead-dialog-head">
        <h2 id={headingId}>{t.heading[shownKind]}</h2>
        <button
          type="button"
          className="lead-dialog-close"
          onClick={close}
          aria-label={t.close}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {status === 'success' ? (
        <output className="lead-form-success" aria-live="polite">
          {t.success}
        </output>
      ) : (
        <form className="lead-form" onSubmit={handleSubmit}>
          <label htmlFor={`${id}-name`}>{t.name}</label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
          />

          <label htmlFor={`${id}-email`}>{t.email}</label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />

          <label htmlFor={`${id}-org`}>{t.org}</label>
          <input
            id={`${id}-org`}
            name="org"
            type="text"
            required
            maxLength={200}
            autoComplete="organization"
          />

          <label htmlFor={`${id}-message`}>{t.message}</label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={4}
            maxLength={5000}
          />

          {/* Left empty by people; bots that fill every field give themselves away. */}
          <div className="lead-form-trap" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div ref={widgetRef} className="lead-form-turnstile" />

          <p className="lead-form-privacy">
            {t.privacy}{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener">
              {t.privacyLink}
            </a>
          </p>

          <output aria-live="polite" className="lead-form-status">
            {status === 'failure' ? (
              <span className="lead-form-failure">
                {t.failure}{' '}
                <a href="mailto:info@anamata.ai">info@anamata.ai</a>.
              </span>
            ) : null}
          </output>

          <button
            type="submit"
            className="button button-primary lead-form-submit"
            disabled={status === 'sending'}
            aria-busy={status === 'sending'}
          >
            {t.submit}
          </button>
        </form>
      )}
    </dialog>
  );
}
