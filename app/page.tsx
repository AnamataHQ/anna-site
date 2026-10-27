'use client';

import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Languages,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import Image from 'next/image';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { captureLandingSource, LeadFormDialog } from '@/components/lead-form';
import { PaperHero } from '@/components/paper-hero';
import type { LeadKind } from '@/lib/lead-capture';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Language = 'en' | 'nl';

const EXECUTION_DELAY_MS = 1600;

const content = {
  en: {
    language: 'en',
    languageName: 'English',
    otherLanguage: 'Nederlands',
    nav: {
      how: 'How Anna works',
      control: 'You stay in control',
      connectors: 'Connectors',
    },
    earlyAccess: 'Request early access',
    contact: 'Contact Anamata',
    eyebrow: 'Your digital AI assistant',
    heroTitle: 'Anna does the work nobody should waste time on.',
    heroBody:
      'Ask her in Teams or Slack. She connects to the systems your work lives in, asks before she acts, and reports back.',
    trust: 'Early access, 2026',
    facts: [
      'Works inside Microsoft Teams and Slack',
      'Connects over OAuth to the systems you already use',
      'Asks before she acts, within the rights you grant',
    ],
    heroAria:
      "A paper-craft room. A small figure at a desk raises one card, which floats up to the knot of a paper mobile marked with Anna's logo. From the knot, threads hold five paper trays, each with one object: a clock, a calendar, an envelope, an ID card or a folder. Sheets rise from three trays into the knot and come down from it into two. A folder with the same mark comes down to the desk.",
    connectorsKicker: 'Every system the work lives in',
    connectorsTitle: 'Anna connects to the systems you already use.',
    connectorsBody:
      'Anna works through MCP connectors that sign in with OAuth. You grant the rights, she works within them.',
    ringLabel: 'Among thousands of connectors',
    ringAria:
      "A paper disc with Anna's mark, with twelve smaller paper discs pinned around it, each with the mark and name of one system, and a paper thread from Anna's disc to every one of them. A few threads run on past the edge of the picture.",
    customBody:
      'If it has a workable API, Anamata can build a connector for it during onboarding.',
    requestConnector: 'Request a connector',
    problemKicker: 'Useful work. Wrong use of your time.',
    problemTitle: 'Anna handles the work around the work.',
    problemBody:
      'The small tasks that interrupt a day are often essential. They are also predictable, repeatable and ready to be handled differently.',
    capabilities: [
      {
        number: '01',
        title: 'Answers',
        body: 'Gives colleagues clear answers using the information and rules your organisation already trusts.',
      },
      {
        number: '02',
        title: 'Prepares',
        body: 'Collects context, checks what is needed and gets the next action ready for review.',
      },
      {
        number: '03',
        title: 'Executes',
        body: 'Completes approved actions in connected systems and reports what happened.',
      },
    ],
    examplesKicker: 'Three things to start with',
    examplesTitle: 'Work your team recognises.',
    examples: [
      {
        tray: 1,
        title: 'Hours in ClockWise',
        ask: 'Log my hours for this week.',
        outcome:
          'Anna fills the week from your calendar and projects, shows you the sheet and submits it once you say so.',
      },
      {
        tray: 2,
        title: 'Leave via Loket',
        ask: 'Can I take next Friday off?',
        outcome:
          'Anna checks your balance and the policy, prepares the request and files it after your approval.',
      },
      {
        tray: 3,
        title: 'Follow-up in HubSpot',
        ask: 'Who did we promise a follow-up this week?',
        outcome:
          'Anna lists the open promises on your deals, drafts the follow-ups and logs what was sent.',
      },
    ],
    workflowKicker: 'One request, from start to finish',
    workflowTitle: 'Watch the work happen.',
    workflowIntro:
      'A colleague asks in Microsoft Teams or Slack. Anna retrieves the right context, pauses for approval when needed and reports the completed result in the same conversation.',
    demoLabel: 'DEMO · NOT THE LIVE RECORD',
    demoChannel: 'Microsoft Teams · Anna',
    retrieving: 'Retrieving context',
    ready: 'Context ready',
    approvalGate: 'Human approval required',
    approve: 'Approve and continue',
    executing: 'Anna is carrying this out…',
    approved: 'Approved',
    replay: 'Replay conversation',
    pause: 'Pause conversation',
    resume: 'Resume conversation',
    demoHint:
      'Choose a situation. The conversation plays once, then waits for your approval.',
    record: 'A clear record remains',
    scenarios: [
      {
        id: 'leave',
        label: 'Leave request',
        person: 'Can I take next Friday off?',
        answer: 'I can check that and prepare the request for you.',
        context: '9 days remaining · leave policy checked · manager identified',
        sources: ['Loket', 'Leave policy'],
        approval:
          'Everything checks out. Shall I file the leave request for approval?',
        result:
          'Done. Your leave request is filed and waiting for your manager’s approval. I’ll update you here.',
      },
      {
        id: 'hours',
        label: 'Hours',
        person: 'Log my hours for this week.',
        answer:
          'I’ll fill the week from your calendar and projects, then show you the sheet.',
        context: '5 days · 2 projects · 38 h from your calendar',
        sources: ['ClockWise', 'Calendar'],
        approval:
          'The sheet matches your calendar. Shall I submit it in ClockWise?',
        result:
          'Submitted. Your week is in ClockWise and waiting for approval. I’ll let you know here.',
      },
      {
        id: 'follow-up',
        label: 'Follow-up',
        person: 'Who did we promise a follow-up this week?',
        answer: 'I’ll check the open deals and draft the follow-ups.',
        context: '3 promises open · drafts ready · nothing sent yet',
        sources: ['HubSpot', 'Mail'],
        approval:
          'Three drafts are ready for your review. Shall I send them and log them in HubSpot?',
        result:
          'Sent. Three follow-ups went out and are logged on their deals in HubSpot.',
      },
    ],
    controlKicker: 'Initiative, with boundaries',
    controlTitle: 'Anna can move work forward. You decide how far.',
    controlBody:
      'Set the rules once. Anna works within them, asks when judgement is needed and keeps a clear record of every completed action.',
    boundaryCards: [
      {
        title: 'Anna does',
        body: 'Answer, collect context, prepare work and carry out actions that sit inside her permissions.',
      },
      {
        title: 'Anna asks',
        body: 'When information is missing, judgement is needed or an action reaches an approval boundary.',
      },
      {
        title: 'Anna never does without permission',
        body: 'Make consequential decisions, step outside configured access or quietly act without leaving a record.',
      },
    ],
    ctaKicker: 'Give time back to the work that needs you',
    ctaTitle: 'Show us the tasks that keep getting in the way.',
    ctaBody:
      'In a short conversation, we map one real workflow and show where Anna can help safely and practically.',
    footerLine: 'Anna is your digital AI assistant by Anamata.',
    transparency:
      'Anna is AI. She identifies herself as such, and people remain in control of what she may do.',
  },
  nl: {
    language: 'nl',
    languageName: 'Nederlands',
    otherLanguage: 'English',
    nav: {
      how: 'Zo werkt Anna',
      control: 'Jij houdt de regie',
      connectors: 'Koppelingen',
    },
    earlyAccess: 'Vraag vroege toegang aan',
    contact: 'Neem contact op',
    eyebrow: 'Jouw digitale AI-assistent',
    heroTitle:
      'Anna doet het werk waar niemand tijd aan zou moeten verspillen.',
    heroBody:
      'Vraag het haar in Teams of Slack. Ze verbindt met de systemen waar jouw werk in staat, vraagt voordat ze handelt en koppelt terug.',
    trust: 'Vroege toegang, 2026',
    facts: [
      'Werkt in Microsoft Teams en Slack',
      'Koppelt via OAuth met de systemen die je al gebruikt',
      'Vraagt voordat ze handelt, binnen de rechten die jij geeft',
    ],
    heroAria:
      'Een kamer van papier. Een klein figuur aan een bureau steekt één kaartje omhoog, dat omhoog zweeft naar de knoop van een papieren mobiel met het logo van Anna. Aan de knoop hangen vijf papieren bakjes, elk met één voorwerp: een klok, een kalender, een envelop, een pasje of een map. Vellen papier stijgen uit drie bakjes op naar de knoop en dalen uit de knoop neer in twee andere. Een map met hetzelfde logo komt neer op het bureau.',
    connectorsKicker: 'Elk systeem waar het werk in staat',
    connectorsTitle: 'Anna verbindt met de systemen die je al gebruikt.',
    connectorsBody:
      'Anna werkt via MCP-koppelingen die inloggen met OAuth. Jij geeft de rechten, zij werkt daarbinnen.',
    ringLabel: 'Een greep uit duizenden koppelingen',
    ringAria:
      "Een papieren schijf met het merk van Anna, met daaromheen twaalf kleinere papieren schijfjes, elk met het merk en de naam van één systeem, en een papieren draad van Anna's schijf naar elk schijfje. Een paar draden lopen door tot voorbij de rand van het beeld.",
    customBody:
      'Als het een werkbare API heeft, kan Anamata er tijdens de onboarding een koppeling voor bouwen.',
    requestConnector: 'Vraag een koppeling aan',
    problemKicker: 'Nuttig werk. Verkeerd gebruik van je tijd.',
    problemTitle: 'Anna doet het werk rondom het werk.',
    problemBody:
      'De kleine taken die je dag onderbreken zijn vaak essentieel. Ze zijn ook voorspelbaar, herhaalbaar en klaar om anders te worden uitgevoerd.',
    capabilities: [
      {
        number: '01',
        title: 'Beantwoordt',
        body: 'Geeft collega’s duidelijke antwoorden met de informatie en regels die je organisatie al vertrouwt.',
      },
      {
        number: '02',
        title: 'Bereidt voor',
        body: 'Verzamelt context, controleert wat nodig is en zet de volgende actie klaar voor beoordeling.',
      },
      {
        number: '03',
        title: 'Voert uit',
        body: 'Rondt goedgekeurde acties af in gekoppelde systemen en rapporteert wat er is gebeurd.',
      },
    ],
    examplesKicker: 'Drie dingen om mee te beginnen',
    examplesTitle: 'Werk dat je team herkent.',
    examples: [
      {
        tray: 1,
        title: 'Uren boeken in ClockWise',
        ask: 'Boek mijn uren voor deze week.',
        outcome:
          'Anna vult de week vanuit je agenda en projecten, laat je het overzicht zien en dient het in zodra jij dat zegt.',
      },
      {
        tray: 2,
        title: 'Verlof via Loket',
        ask: 'Kan ik volgende vrijdag vrij nemen?',
        outcome:
          'Anna controleert je saldo en het beleid, bereidt de aanvraag voor en dient hem in na jouw goedkeuring.',
      },
      {
        tray: 3,
        title: 'Opvolging in HubSpot',
        ask: 'Wie hebben we deze week een opvolging beloofd?',
        outcome:
          'Anna zet de open beloftes uit je deals op een rij, schrijft de opvolgingen en legt vast wat is verstuurd.',
      },
    ],
    workflowKicker: 'Eén verzoek, van begin tot eind',
    workflowTitle: 'Bekijk hoe het werk gebeurt.',
    workflowIntro:
      'Een collega vraagt iets in Microsoft Teams of Slack. Anna haalt de juiste context op, pauzeert voor goedkeuring als dat nodig is en meldt het afgeronde resultaat in hetzelfde gesprek.',
    demoLabel: 'DEMO · GEEN ECHT DOSSIER',
    demoChannel: 'Microsoft Teams · Anna',
    retrieving: 'Context ophalen',
    ready: 'Context gereed',
    approvalGate: 'Menselijke goedkeuring nodig',
    approve: 'Goedkeuren en doorgaan',
    executing: 'Anna voert dit nu uit…',
    approved: 'Goedgekeurd',
    replay: 'Gesprek opnieuw afspelen',
    pause: 'Gesprek pauzeren',
    resume: 'Gesprek hervatten',
    demoHint:
      'Kies een situatie. Het gesprek speelt één keer af en wacht dan op jouw goedkeuring.',
    record: 'Er blijft een duidelijk verslag achter',
    scenarios: [
      {
        id: 'leave',
        label: 'Verlofaanvraag',
        person: 'Kan ik volgende vrijdag vrij nemen?',
        answer: 'Ik kan dat controleren en de aanvraag voor je voorbereiden.',
        context: '9 dagen over · verlofbeleid gecontroleerd · manager gevonden',
        sources: ['Loket', 'Verlofbeleid'],
        approval:
          'Alles klopt. Zal ik de verlofaanvraag ter goedkeuring indienen?',
        result:
          'Geregeld. Je verlofaanvraag is ingediend en wacht op goedkeuring van je manager. Ik houd je hier op de hoogte.',
      },
      {
        id: 'hours',
        label: 'Uren',
        person: 'Boek mijn uren voor deze week.',
        answer:
          'Ik vul de week vanuit je agenda en projecten en laat je het overzicht zien.',
        context: '5 dagen · 2 projecten · 38 u uit je agenda',
        sources: ['ClockWise', 'Agenda'],
        approval:
          'Het overzicht klopt met je agenda. Zal ik het indienen in ClockWise?',
        result:
          'Ingediend. Je week staat in ClockWise en wacht op goedkeuring. Ik laat het je hier weten.',
      },
      {
        id: 'follow-up',
        label: 'Opvolging',
        person: 'Wie hebben we deze week een opvolging beloofd?',
        answer: 'Ik controleer de open deals en zet de opvolgingen klaar.',
        context: '3 beloftes open · concepten klaar · nog niets verstuurd',
        sources: ['HubSpot', 'Mail'],
        approval:
          'Drie concepten staan klaar voor je. Zal ik ze versturen en vastleggen in HubSpot?',
        result:
          'Verstuurd. Drie opvolgingen zijn de deur uit en staan bij hun deals in HubSpot.',
      },
    ],
    controlKicker: 'Initiatief, met grenzen',
    controlTitle: 'Anna kan werk vooruitbrengen. Jij bepaalt hoe ver.',
    controlBody:
      'Stel de regels één keer in. Anna werkt erbinnen, vraagt om hulp wanneer menselijk oordeel nodig is en houdt elke afgeronde actie duidelijk bij.',
    boundaryCards: [
      {
        title: 'Anna doet',
        body: 'Beantwoorden, context verzamelen, werk voorbereiden en acties uitvoeren die binnen haar rechten vallen.',
      },
      {
        title: 'Anna vraagt',
        body: 'Wanneer informatie ontbreekt, menselijk oordeel nodig is of een actie een goedkeuringsgrens bereikt.',
      },
      {
        title: 'Anna doet nooit zonder toestemming',
        body: 'Belangrijke besluiten nemen, buiten ingestelde toegang treden of stilletjes handelen zonder een verslag achter te laten.',
      },
    ],
    ctaKicker: 'Geef tijd terug aan het werk dat jou nodig heeft',
    ctaTitle: 'Laat ons zien welke taken steeds in de weg zitten.',
    ctaBody:
      'In een kort gesprek brengen we één echt werkproces in kaart en laten we zien waar Anna veilig en praktisch kan helpen.',
    footerLine: 'Anna is jouw digitale AI-assistent van Anamata.',
    transparency:
      'Anna is AI. Ze maakt dat altijd duidelijk en mensen houden de regie over wat ze mag doen.',
  },
} as const;

// Twelve of the thousands of connectors, pinned around Anna's knot like
// string on a corkboard: `x`/`y` in percent of the stage, `depth` 1 (near,
// large) to 3 (far, small and faint). Teams is not among them: the hero
// already names it as the place you ask Anna.
const KNOT = { x: 44, y: 46 } as const;
const connectors = [
  {
    name: 'Microsoft 365',
    icon: '/brands/microsoft-365.svg',
    x: 23,
    y: 28,
    depth: 1,
  },
  { name: 'Jira', icon: '/brands/jira.svg', x: 61, y: 20, depth: 1 },
  { name: 'Slack', icon: '/brands/slack.svg', x: 70, y: 60, depth: 1 },
  { name: 'Loket', icon: '/brands/loket.png', x: 31, y: 72, depth: 1 },
  { name: 'Notion', icon: '/brands/notion.svg', x: 52, y: 80, depth: 2 },
  { name: 'GitHub', icon: '/brands/github.svg', x: 85, y: 30, depth: 2 },
  { name: 'HubSpot', icon: '/brands/hubspot.svg', x: 11, y: 54, depth: 2 },
  { name: 'ClockWise', icon: '/brands/clockwise.png', x: 40, y: 12, depth: 2 },
  {
    name: 'Google Drive',
    icon: '/brands/google-drive.svg',
    x: 91,
    y: 74,
    depth: 3,
  },
  { name: 'Confluence', icon: '/brands/confluence.svg', x: 7, y: 20, depth: 3 },
  { name: 'Azure', icon: '/brands/azure.svg', x: 77, y: 7, depth: 3 },
  { name: 'Asana', icon: '/brands/asana.svg', x: 18, y: 90, depth: 3 },
] as const;
// Threads that run on past the edge, to systems we never show.
const LOOSE_THREADS = [
  { x: 105, y: 48 },
  { x: -5, y: 84 },
  { x: 97, y: 106 },
  { x: 56, y: -8 },
] as const;

// The tray sprites of the hero double as the use-case pictograms, so they
// cost nothing extra to load.
const traySizes = {
  1: { width: 320, height: 217 },
  2: { width: 320, height: 206 },
  3: { width: 320, height: 172 },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [leadKind, setLeadKind] = useState<LeadKind | null>(null);
  const [scenarioId, setScenarioId] = useState('leave');
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const executionTimerRef = useRef<number | null>(null);
  const [heroRef, heroVisible, heroHasEntered] =
    useElementVisibility<HTMLDivElement>(0.45);
  const [workflowRef, workflowVisible, workflowHasEntered] =
    useElementVisibility<HTMLElement>(0.28);
  const t = content[language];
  const scenario =
    t.scenarios.find((item) => item.id === scenarioId) ?? t.scenarios[0];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    captureLandingSource();
  }, []);

  // The mailto href stays as the fallback; with JavaScript the form opens.
  const leadOpener =
    (kind: LeadKind) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setLeadKind(kind);
    };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReduceMotion(media.matches);
      if (media.matches) setDemoStep(5);
    };
    const initialUpdate = window.setTimeout(updatePreference, 0);
    media.addEventListener('change', updatePreference);
    return () => {
      window.clearTimeout(initialUpdate);
      media.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    if (!workflowHasEntered) return;
    const timer = window.setTimeout(() => {
      setIsPaused(false);
      setDemoStep(reduceMotion ? 5 : 0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [workflowHasEntered, reduceMotion]);

  useEffect(() => {
    if (!workflowVisible || reduceMotion || isPaused || demoStep >= 4) return;
    const timer = window.setTimeout(() => setDemoStep((step) => step + 1), 920);
    return () => window.clearTimeout(timer);
  }, [demoStep, isPaused, reduceMotion, workflowVisible]);

  useEffect(
    () => () => {
      if (executionTimerRef.current !== null) {
        window.clearTimeout(executionTimerRef.current);
      }
    },
    [],
  );

  const clearExecutionTimer = () => {
    if (executionTimerRef.current !== null) {
      window.clearTimeout(executionTimerRef.current);
      executionTimerRef.current = null;
    }
    setIsExecuting(false);
  };

  const switchLanguage = () =>
    setLanguage((current) => (current === 'en' ? 'nl' : 'en'));
  const restartDemo = () => {
    clearExecutionTimer();
    setIsPaused(false);
    setDemoStep(reduceMotion ? 5 : 0);
    setReplayKey((key) => key + 1);
  };
  const changeScenario = (value: string) => {
    clearExecutionTimer();
    setScenarioId(value);
    setIsPaused(false);
    setDemoStep(reduceMotion ? 5 : 0);
  };
  const approveDemo = () => {
    if (demoStep >= 5 || isExecuting) return;
    setIsExecuting(true);
    executionTimerRef.current = window.setTimeout(() => {
      setDemoStep(5);
      setIsExecuting(false);
      executionTimerRef.current = null;
    }, EXECUTION_DELAY_MS);
  };

  return (
    <main>
      <a className="skip-link" href="#main-content">
        {language === 'en' ? 'Skip to content' : 'Ga naar inhoud'}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Anna by Anamata, home">
          <span className="brand-mark" aria-hidden="true">
            <Image
              src="/brands/anna-color-transparent.svg"
              alt=""
              width={33}
              height={33}
            />
          </span>
          <span className="brand-name">Anna</span>
          <span className="brand-by">by anamata.ai</span>
        </a>
        <nav
          className="desktop-nav"
          aria-label={language === 'en' ? 'Main navigation' : 'Hoofdnavigatie'}
        >
          <a href="#connectors">{t.nav.connectors}</a>
          <a href="#how">{t.nav.how}</a>
          <a href="#control">{t.nav.control}</a>
        </nav>
        <div className="header-actions">
          <button
            className="language-switch"
            type="button"
            onClick={switchLanguage}
            aria-label={`Switch to ${t.otherLanguage}`}
          >
            <Languages size={16} aria-hidden="true" />
            {t.otherLanguage}
          </button>
          <a
            className="header-cta"
            href="mailto:info@anamata.ai?subject=Early%20access%20to%20Anna"
            onClick={leadOpener('demo')}
            aria-haspopup="dialog"
          >
            {t.earlyAccess}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-stage-box" ref={heroRef}>
            <PaperHero
              label={t.heroAria}
              playing={heroHasEntered && heroVisible}
            />
          </div>
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <Image
                src="/brands/anna-color-black.svg"
                alt=""
                width={14}
                height={14}
              />
              {t.eyebrow}
            </p>
            <h1 id="hero-title">{t.heroTitle}</h1>
            <p className="hero-body">{t.heroBody}</p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="mailto:info@anamata.ai?subject=Early%20access%20to%20Anna"
                onClick={leadOpener('demo')}
                aria-haspopup="dialog"
              >
                {t.earlyAccess}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                className="button button-ghost"
                href="mailto:info@anamata.ai"
                onClick={leadOpener('contact')}
                aria-haspopup="dialog"
              >
                {t.contact}
              </a>
            </div>
            <p className="hero-trust">{t.trust}</p>
            <ul className="hero-facts">
              {t.facts.map((fact) => (
                <li key={fact}>
                  <Check size={14} aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="connectors"
          id="connectors"
          aria-labelledby="connectors-title"
        >
          <div className="section-intro">
            <div>
              <p className="eyebrow">{t.connectorsKicker}</p>
              <h2 id="connectors-title">{t.connectorsTitle}</h2>
            </div>
            <p>{t.connectorsBody}</p>
          </div>
          <div className="connector-panel">
            <p className="integration-panel-label">{t.ringLabel}</p>
            <div className="connector-stage" aria-hidden="true">
              <svg className="connector-threads">
                {[...connectors, ...LOOSE_THREADS].map((end, index) => (
                  <line
                    key={index}
                    x1={`${KNOT.x}%`}
                    y1={`${KNOT.y}%`}
                    x2={`${end.x}%`}
                    y2={`${end.y}%`}
                    data-depth={'depth' in end ? end.depth : 3}
                  />
                ))}
              </svg>
              {connectors.map((connector) => (
                <span
                  className="connector-disc"
                  key={connector.name}
                  data-depth={connector.depth}
                  style={{ left: `${connector.x}%`, top: `${connector.y}%` }}
                >
                  <span className="connector-disc-face">
                    <Image src={connector.icon} alt="" width={28} height={28} />
                  </span>
                  <small>{connector.name}</small>
                </span>
              ))}
              {/* Anna: the knot from the hero, her mark on it, a thread to every system. */}
              <div
                className="connector-knot"
                style={{ left: `${KNOT.x}%`, top: `${KNOT.y}%` }}
              >
                <Image
                  src="/brands/anna-mono-dark.svg"
                  width={12}
                  height={12}
                  alt=""
                />
              </div>
            </div>
            <p className="sr-only">{t.ringAria}</p>
            <div className="custom-connector">
              <p>{t.customBody}</p>
              <a href="mailto:info@anamata.ai?subject=Connector%20request%20for%20Anna">
                {t.requestConnector}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          className="capability-section"
          id="how"
          aria-labelledby="capability-title"
        >
          <div className="section-intro">
            <div>
              <p className="eyebrow">{t.problemKicker}</p>
              <h2 id="capability-title">{t.problemTitle}</h2>
            </div>
            <p>{t.problemBody}</p>
          </div>
          <div className="capability-grid">
            {t.capabilities.map((capability) => (
              <article className="capability-card" key={capability.number}>
                <div className="capability-number">{capability.number}</div>
                <div>
                  <h3>{capability.title}</h3>
                  <p>{capability.body}</p>
                </div>
                <ChevronRight aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section
          className="use-case-section"
          id="use-cases"
          aria-labelledby="use-case-title"
        >
          <div className="use-case-heading">
            <p className="eyebrow">{t.examplesKicker}</p>
            <h2 id="use-case-title">{t.examplesTitle}</h2>
          </div>
          <div className="use-case-grid">
            {t.examples.map((example) => (
              <article className="use-case" key={example.title}>
                <Image
                  className="use-case-tray"
                  src={`/hero/tray-${example.tray}.webp`}
                  width={traySizes[example.tray].width}
                  height={traySizes[example.tray].height}
                  alt=""
                  loading="lazy"
                />
                <h3>{example.title}</h3>
                <p className="use-case-ask">“{example.ask}”</p>
                <p>{example.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="workflow-section"
          aria-labelledby="workflow-title"
          ref={workflowRef}
          data-in-view={workflowHasEntered}
        >
          <div className="workflow-heading">
            <p className="eyebrow">{t.workflowKicker}</p>
            <h2 id="workflow-title">{t.workflowTitle}</h2>
            <p>{t.workflowIntro}</p>
          </div>
          <div className="scenario-shell paper-panel">
            <Tabs value={scenarioId} onValueChange={changeScenario}>
              <div className="scenario-controls">
                <TabsList
                  className="scenario-tabs"
                  aria-label={
                    language === 'en'
                      ? 'Choose a demo situation'
                      : 'Kies een demosituatie'
                  }
                >
                  {t.scenarios.map((item) => (
                    <TabsTrigger value={item.id} key={item.id}>
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="playback-controls">
                  <button
                    type="button"
                    onClick={restartDemo}
                    aria-label={t.replay}
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                    {t.replay}
                  </button>
                  {!reduceMotion && demoStep < 4 && (
                    <button
                      type="button"
                      onClick={() => setIsPaused((paused) => !paused)}
                      aria-label={isPaused ? t.resume : t.pause}
                    >
                      {isPaused ? (
                        <Play size={15} aria-hidden="true" />
                      ) : (
                        <Pause size={15} aria-hidden="true" />
                      )}
                      {isPaused ? t.resume : t.pause}
                    </button>
                  )}
                </div>
              </div>
            </Tabs>
            <p className="demo-hint">{t.demoHint}</p>

            <div className="demo-window" key={`${scenarioId}-${replayKey}`}>
              <div className="demo-toolbar">
                <div className="demo-channel">
                  <Image
                    className="teams-mini"
                    src="/brands/microsoft-teams.svg"
                    alt=""
                    width={25}
                    height={25}
                    aria-hidden="true"
                  />
                  <strong>{t.demoChannel}</strong>
                </div>
                <span>{t.demoLabel}</span>
              </div>
              <div className="demo-thread" aria-live="polite">
                <DemoMessage visible={demoStep >= 0} avatar="Y" kind="person">
                  <p>{scenario.person}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 1} kind="anna">
                  <p>{scenario.answer}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 2} kind="anna">
                  <div className="context-card" data-ready={demoStep >= 3}>
                    <div className="context-card-title">
                      {demoStep >= 3 ? (
                        <CircleCheck size={17} aria-hidden="true" />
                      ) : (
                        <Search size={17} aria-hidden="true" />
                      )}
                      <strong>{demoStep >= 3 ? t.ready : t.retrieving}</strong>
                      {demoStep < 3 && (
                        <span className="typing-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      )}
                    </div>
                    <p>{scenario.context}</p>
                    <div className="source-pills">
                      {scenario.sources.map((source) => (
                        <span key={source}>{source}</span>
                      ))}
                    </div>
                  </div>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 4} kind="anna">
                  <div className="approval-card">
                    <div className="approval-kicker">
                      <UserRoundCheck size={16} aria-hidden="true" />
                      {demoStep >= 5 ? t.approved : t.approvalGate}
                    </div>
                    <p>{scenario.approval}</p>
                    <button
                      type="button"
                      className="approve-button"
                      onClick={approveDemo}
                      disabled={demoStep >= 5 || isExecuting}
                      aria-busy={isExecuting}
                      data-executing={isExecuting}
                    >
                      <Check size={16} aria-hidden="true" />{' '}
                      {demoStep >= 5
                        ? t.approved
                        : isExecuting
                          ? t.executing
                          : t.approve}
                    </button>
                  </div>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 5} kind="anna">
                  <div className="result-message">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <p>{scenario.result}</p>
                  </div>
                </DemoMessage>
                <div
                  className="record-line"
                  data-visible={demoStep >= 5}
                  aria-hidden={demoStep < 5}
                >
                  <LockKeyhole size={15} aria-hidden="true" /> {t.record}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="control-section"
          id="control"
          aria-labelledby="control-title"
        >
          <div className="control-statement">
            <p className="eyebrow light">{t.controlKicker}</p>
            <h2 id="control-title">{t.controlTitle}</h2>
            <p>{t.controlBody}</p>
          </div>
          <div className="boundary-grid">
            {t.boundaryCards.map((card, index) => (
              <article className="boundary-card" key={card.title}>
                {index === 0 ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : index === 1 ? (
                  <UserRoundCheck aria-hidden="true" />
                ) : (
                  <ShieldCheck aria-hidden="true" />
                )}
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <p className="eyebrow">{t.ctaKicker}</p>
          <h2 id="cta-title">{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <div className="cta-actions">
            <a
              className="button button-primary"
              href="mailto:info@anamata.ai?subject=Early%20access%20to%20Anna"
              onClick={leadOpener('demo')}
              aria-haspopup="dialog"
            >
              {t.earlyAccess}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              className="text-link"
              href="mailto:info@anamata.ai"
              onClick={leadOpener('contact')}
              aria-haspopup="dialog"
            >
              {t.contact}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <Image
              src="/brands/anna-mono-light.svg"
              alt=""
              width={33}
              height={33}
            />
          </span>
          <span className="brand-name">Anna</span>
        </a>
        <div className="footer-copy">
          <strong>{t.footerLine}</strong>
          <p>{t.transparency}</p>
          <p>
            Anamata BV · KvK 78520185 ·{' '}
            <a className="footer-privacy" href={`/privacy#${language}`}>
              {language === 'en' ? 'Privacy statement' : 'Privacyverklaring'}
            </a>
          </p>
        </div>
        <a href="https://anamata.ai">
          anamata.ai <ArrowRight size={15} aria-hidden="true" />
        </a>
      </footer>

      <LeadFormDialog
        kind={leadKind}
        language={language}
        onClose={() => setLeadKind(null)}
      />
    </main>
  );
}

function DemoMessage({
  visible,
  avatar,
  kind,
  children,
}: {
  visible: boolean;
  avatar?: string;
  kind: 'person' | 'anna';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`message-row ${kind === 'anna' ? 'anna-row' : ''}`}
      data-visible={visible}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className={`avatar ${kind}`} aria-hidden="true">
        {kind === 'anna' ? (
          <Image
            src="/brands/anna-color-navy.svg"
            alt=""
            width={34}
            height={34}
          />
        ) : (
          avatar
        )}
      </div>
      <div className="message-bubble">{children}</div>
    </div>
  );
}

function useElementVisibility<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      const fallback = setTimeout(() => {
        setIsVisible(true);
        setHasEntered(true);
      }, 0);
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible, hasEntered] as const;
}
