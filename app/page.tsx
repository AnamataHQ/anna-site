'use client';

import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  FileCheck2,
  Languages,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { captureLandingSource, LeadFormDialog } from '@/components/lead-form';
import type { LeadKind } from '@/lib/lead-capture';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Language = 'en' | 'nl';

const EXECUTION_DELAY_MS = 1600;
const CALENDAR_MERGE_DELAY_MS = 6800;
const CALENDAR_MERGE_DURATION_MS = 2900;
const INITIAL_FOCUS_WINDOW = { start: 715, end: 745 } as const;
const FINAL_FOCUS_WINDOW = { start: 480, end: 1020 } as const;

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

const formatCalendarTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const anchorSegment = focusSegments[3];

const content = {
  en: {
    language: 'en',
    languageName: 'English',
    otherLanguage: 'Nederlands',
    nav: {
      how: 'How Anna works',
      control: 'You stay in control',
      fit: 'Where she fits',
      demo: 'Book a demo',
    },
    eyebrow: 'Your digital AI assistant',
    heroTitle:
      'The work still needs doing. It does not need to take your time.',
    heroBody:
      'Anna takes care of repetitive coordination and administration for small and mid-sized organisations. She answers, prepares and acts, while your team stays in control.',
    bookDemo: 'Book a demo',
    contact: 'Contact Anamata',
    scroll: 'See how she works',
    day: {
      aria: 'A working day where Anna clears routine administration and gives focus time back.',
      date: 'Tuesday · 18 June',
      view: 'Work week',
      today: 'Today',
      weekday: 'TUE 18',
      focus: 'Work that needs you',
      focusDetail: 'Strategy · decisions · people',
      finalTime: '08:00–17:00',
      tasks: [
        {
          label: 'Inbox triage',
          time: '09:00–09:25',
          start: 60,
          duration: 25,
          incoming: false,
        },
        {
          label: 'Follow-ups',
          time: '10:25–10:45',
          start: 145,
          duration: 20,
          incoming: false,
        },
        {
          label: 'Leave request',
          time: '11:30–11:55',
          start: 210,
          duration: 25,
          incoming: false,
        },
        {
          label: 'Meeting prep',
          time: '12:25–12:55',
          start: 265,
          duration: 30,
          incoming: false,
        },
        {
          label: 'Update records',
          time: '13:40–14:00',
          start: 340,
          duration: 20,
          incoming: true,
        },
        {
          label: 'Send reminders',
          time: '15:00–15:20',
          start: 420,
          duration: 20,
          incoming: true,
        },
        {
          label: 'Status update',
          time: '16:10–16:30',
          start: 490,
          duration: 20,
          incoming: false,
        },
      ],
      handled: 'Handled by Anna',
      handledCount: '7 routine tasks completed',
      returned: 'Time returned',
      returnedAmount: '2h 40m',
      before: 'Before · 7 routine tasks split up the day',
      after: 'After · 08:00–17:00 for work that needs you',
    },
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
    examplesKicker: 'Recognisable across the team',
    examplesTitle: 'Start with the tasks everyone keeps putting off.',
    taskGroups: [
      {
        title: 'HR',
        examples: [
          'Answer routine policy questions',
          'Prepare leave requests',
          'Keep employee records current',
        ],
      },
      {
        title: 'Operations',
        examples: [
          'Check project handovers',
          'Route recurring requests',
          'Prepare status updates',
        ],
      },
      {
        title: 'Office management',
        examples: [
          'Book desks and rooms',
          'Follow up on confirmations',
          'Answer workplace questions',
        ],
      },
    ],
    workflowKicker: 'One request, from start to finish',
    workflowTitle: 'Watch the work happen.',
    workflowIntro:
      'A colleague asks in Microsoft Teams. Anna retrieves the right context, pauses for approval when needed and reports the completed result in the same conversation.',
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
        id: 'desk',
        label: 'Desk booking',
        person: 'Can you book my usual desk for Thursday?',
        answer: 'Yes. I’ll check your preference and what is available.',
        context: 'Thursday 08:00–15:00 · usual area · desk 528 available',
        sources: ['Workplace guide', 'Desk availability'],
        approval: 'Desk 528 is free for your usual hours. Shall I book it?',
        result:
          'Booked. Desk 528 is yours on Thursday from 08:00 to 15:00. The confirmation is in this chat.',
      },
      {
        id: 'record',
        label: 'Record update',
        person: 'Please add today’s status to the project handover record.',
        answer: 'I’ll collect the latest agreed status and prepare the update.',
        context:
          'Latest team update found · 3 changes · editor permission checked',
        sources: ['Project notes', 'Handover record'],
        approval:
          'I have prepared three changes. Would you like me to apply them to the handover record?',
        result:
          'Updated. Three changes were added to the handover record, with a link and timestamp saved here.',
      },
    ],
    controlKicker: 'Initiative, with boundaries',
    controlTitle: 'Anna can move work forward. You decide how far.',
    controlBody:
      'Set the rules once. Anna works within them, asks when judgement is needed and keeps a clear record of every completed action.',
    controlPoints: [
      'Your systems and permissions remain the source of truth.',
      'Sensitive actions can always require human approval.',
      'Every result is reported back to the team.',
      'Anna is always clearly presented as AI.',
    ],
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
    fitKicker: 'Fits into the workday',
    fitTitle: 'Works where your team already works.',
    fitBody:
      'Anna meets colleagues in the channels they already use and works with the operational systems behind them. Start with what ships with Anna, then connect the rest of your landscape.',
    integrationLabel: 'Your connected workday',
    available: 'Available now',
    availableNote: 'The work surfaces Anna can connect with today.',
    shipping: 'Shipping with Anna',
    shippingNote:
      'Anamata’s Mendix workflows, ready as part of the Anna launch.',
    roadmap: 'Communication roadmap',
    roadmapNote:
      'Microsoft Teams today, with Slack on the cards as another way to work with Anna.',
    examples: 'Examples, not limits',
    scaleTitle: 'One Anna. Thousands of business systems.',
    scaleBody:
      'The next layer is SSO-secured MCP connectors. As full SSO support comes online, they open up the major corporate platforms your organisation already runs. These logos show the breadth, not a fixed catalogue.',
    customTitle: 'If it has an API, it can join the workflow.',
    customBody:
      'For internal or specialist systems without their own connector, Anamata can build one during onboarding.',
    requestConnector: 'Request a connector',
    connectorNote: 'Tell us which system your team needs next.',
    ctaKicker: 'Give time back to the work that needs you',
    ctaTitle: 'Show us the tasks that keep getting in the way.',
    ctaBody:
      'In a short conversation, we will map one real workflow and show where Anna can help safely and practically.',
    ctaPrimary: 'Book a demo',
    ctaSecondary: 'Contact Anamata',
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
      fit: 'Waar ze werkt',
      demo: 'Plan een demo',
    },
    eyebrow: 'Jouw digitale AI-assistent',
    heroTitle:
      'Het werk moet nog steeds gebeuren. Het hoeft niet jouw tijd te kosten.',
    heroBody:
      'Anna neemt terugkerende afstemming en administratie over voor kleine en middelgrote organisaties. Ze beantwoordt, bereidt voor en voert uit, terwijl jouw team de regie houdt.',
    bookDemo: 'Plan een demo',
    contact: 'Neem contact op',
    scroll: 'Bekijk hoe ze werkt',
    day: {
      aria: 'Een werkdag waarin Anna routineadministratie afhandelt en focustijd teruggeeft.',
      date: 'Dinsdag · 18 juni',
      view: 'Werkweek',
      today: 'Vandaag',
      weekday: 'DI 18',
      focus: 'Werk dat jou nodig heeft',
      focusDetail: 'Strategie · besluiten · mensen',
      finalTime: '08:00–17:00',
      tasks: [
        {
          label: 'Inbox verwerken',
          time: '09:00–09:25',
          start: 60,
          duration: 25,
          incoming: false,
        },
        {
          label: 'Opvolging',
          time: '10:25–10:45',
          start: 145,
          duration: 20,
          incoming: false,
        },
        {
          label: 'Verlofaanvraag',
          time: '11:30–11:55',
          start: 210,
          duration: 25,
          incoming: false,
        },
        {
          label: 'Overleg voorbereiden',
          time: '12:25–12:55',
          start: 265,
          duration: 30,
          incoming: false,
        },
        {
          label: 'Dossiers bijwerken',
          time: '13:40–14:00',
          start: 340,
          duration: 20,
          incoming: true,
        },
        {
          label: 'Herinneringen sturen',
          time: '15:00–15:20',
          start: 420,
          duration: 20,
          incoming: true,
        },
        {
          label: 'Status bijwerken',
          time: '16:10–16:30',
          start: 490,
          duration: 20,
          incoming: false,
        },
      ],
      handled: 'Afgehandeld door Anna',
      handledCount: '7 routinetaken afgerond',
      returned: 'Tijd terug',
      returnedAmount: '2u 40m',
      before: 'Voor · 7 routinetaken versnipperen de dag',
      after: 'Na · 08:00–17:00 voor werk dat jou nodig heeft',
    },
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
    examplesKicker: 'Herkenbaar voor het hele team',
    examplesTitle: 'Begin bij de taken die iedereen blijft uitstellen.',
    taskGroups: [
      {
        title: 'HR',
        examples: [
          'Beantwoord terugkerende beleidsvragen',
          'Bereid verlofaanvragen voor',
          'Houd medewerkersdossiers bij',
        ],
      },
      {
        title: 'Operations',
        examples: [
          'Controleer projectoverdrachten',
          'Routeer terugkerende verzoeken',
          'Bereid statusupdates voor',
        ],
      },
      {
        title: 'Office management',
        examples: [
          'Boek werkplekken en ruimtes',
          'Volg bevestigingen op',
          'Beantwoord werkplekvragen',
        ],
      },
    ],
    workflowKicker: 'Eén verzoek, van begin tot eind',
    workflowTitle: 'Bekijk hoe het werk gebeurt.',
    workflowIntro:
      'Een collega vraagt iets in Microsoft Teams. Anna haalt de juiste context op, pauzeert voor goedkeuring als dat nodig is en meldt het afgeronde resultaat in hetzelfde gesprek.',
    demoLabel: 'DEMO · NOT THE LIVE RECORD',
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
        id: 'desk',
        label: 'Werkplek boeken',
        person: 'Kun je mijn gebruikelijke werkplek voor donderdag boeken?',
        answer: 'Ja. Ik controleer je voorkeur en wat er beschikbaar is.',
        context:
          'Donderdag 08:00–15:00 · vaste zone · werkplek 528 beschikbaar',
        sources: ['Werkplekgids', 'Beschikbaarheid'],
        approval:
          'Werkplek 528 is vrij op je gebruikelijke tijden. Zal ik deze boeken?',
        result:
          'Geboekt. Werkplek 528 is donderdag van 08:00 tot 15:00 voor jou. De bevestiging staat in dit gesprek.',
      },
      {
        id: 'record',
        label: 'Dossier bijwerken',
        person:
          'Voeg de status van vandaag toe aan het projectoverdrachtsdossier.',
        answer:
          'Ik verzamel de laatst afgesproken status en bereid de wijziging voor.',
        context:
          'Laatste teamupdate gevonden · 3 wijzigingen · schrijfrecht gecontroleerd',
        sources: ['Projectnotities', 'Overdrachtsdossier'],
        approval:
          'Ik heb drie wijzigingen voorbereid. Zal ik ze in het overdrachtsdossier verwerken?',
        result:
          'Bijgewerkt. Drie wijzigingen zijn toegevoegd aan het overdrachtsdossier, met link en tijdstip in dit gesprek.',
      },
    ],
    controlKicker: 'Initiatief, met grenzen',
    controlTitle: 'Anna kan werk vooruitbrengen. Jij bepaalt hoe ver.',
    controlBody:
      'Stel de regels één keer in. Anna werkt erbinnen, vraagt om hulp wanneer menselijk oordeel nodig is en houdt elke afgeronde actie duidelijk bij.',
    controlPoints: [
      'Jouw systemen en rechten blijven de bron van waarheid.',
      'Gevoelige acties kunnen altijd menselijke goedkeuring vereisen.',
      'Elk resultaat wordt teruggemeld aan het team.',
      'Anna wordt altijd duidelijk als AI gepresenteerd.',
    ],
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
    fitKicker: 'Past in de werkdag',
    fitTitle: 'Werkt waar jouw team al werkt.',
    fitBody:
      'Anna ontmoet collega’s in de kanalen die ze al gebruiken en werkt met de operationele systemen daarachter. Begin met wat met Anna wordt geleverd en verbind daarna de rest van je landschap.',
    integrationLabel: 'Jouw verbonden werkdag',
    available: 'Nu beschikbaar',
    availableNote: 'De werkomgevingen waarmee Anna vandaag kan verbinden.',
    shipping: 'Wordt met Anna geleverd',
    shippingNote:
      'De Mendix-werkprocessen van Anamata, klaar als onderdeel van de lancering van Anna.',
    roadmap: 'Roadmap communicatie',
    roadmapNote:
      'Microsoft Teams vandaag, met Slack op de planning als extra manier om met Anna te werken.',
    examples: 'Voorbeelden, geen grenzen',
    scaleTitle: 'Eén Anna. Duizenden bedrijfssystemen.',
    scaleBody:
      'De volgende laag bestaat uit MCP-koppelingen met SSO. Zodra volledige SSO-ondersteuning beschikbaar is, openen ze de grote bedrijfsplatforms die jouw organisatie al gebruikt. Deze logo’s tonen de breedte, niet een vaste catalogus.',
    customTitle: 'Als het een API heeft, kan het meedoen in het werkproces.',
    customBody:
      'Voor interne of specialistische systemen zonder eigen koppeling kan Anamata er tijdens de onboarding een bouwen.',
    requestConnector: 'Vraag een koppeling aan',
    connectorNote:
      'Vertel ons welk systeem jouw team als volgende nodig heeft.',
    ctaKicker: 'Geef tijd terug aan het werk dat jou nodig heeft',
    ctaTitle: 'Laat ons zien welke taken steeds in de weg zitten.',
    ctaBody:
      'In een kort gesprek brengen we één echt werkproces in kaart en laten we zien waar Anna veilig en praktisch kan helpen.',
    ctaPrimary: 'Plan een demo',
    ctaSecondary: 'Neem contact op',
    footerLine: 'Anna is jouw digitale AI-assistent van Anamata.',
    transparency:
      'Anna is AI. Ze maakt dat altijd duidelijk en mensen houden de regie over wat ze mag doen.',
  },
} as const;

const availableIntegrations = [
  { name: 'Microsoft Teams', icon: '/brands/microsoft-teams.svg' },
  { name: 'ClockWise', icon: '/brands/clockwise.png' },
  { name: 'Loket', icon: '/brands/loket.png' },
] as const;

const shippingIntegrations = {
  en: [
    { name: 'Mendix office seat booking', icon: '/brands/mendix.svg' },
    { name: 'Mendix CV updates', icon: '/brands/mendix.svg' },
  ],
  nl: [
    { name: 'Mendix werkplek boeken', icon: '/brands/mendix.svg' },
    { name: 'Mendix cv bijwerken', icon: '/brands/mendix.svg' },
  ],
} as const;

const ecosystemExamples = [
  { name: 'Microsoft 365', icon: '/brands/microsoft-365.svg' },
  { name: 'Atlassian', icon: '/brands/atlassian.svg' },
  { name: 'Jira', icon: '/brands/jira.svg' },
  { name: 'Notion', icon: '/brands/notion.svg' },
  { name: 'GitHub', icon: '/brands/github.svg' },
] as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [leadKind, setLeadKind] = useState<LeadKind | null>(null);
  const [scenarioId, setScenarioId] = useState('leave');
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusWindow, setFocusWindow] = useState<{
    start: number;
    end: number;
  }>(INITIAL_FOCUS_WINDOW);
  const executionTimerRef = useRef<number | null>(null);
  const [heroRef, , heroHasEntered] = useElementVisibility<HTMLDivElement>();
  const [workflowRef, workflowVisible, workflowHasEntered] =
    useElementVisibility<HTMLElement>(0.28);
  const t = content[language];
  const scenario =
    t.scenarios.find((item) => item.id === scenarioId) ?? t.scenarios[0];
  const focusTime = `${formatCalendarTime(focusWindow.start)}–${formatCalendarTime(focusWindow.end)}`;

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
    if (!heroHasEntered) return;

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
  }, [heroHasEntered, reduceMotion]);

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
          <span className="brand-name">ANNA</span>
          <span className="brand-by">by anamata.ai</span>
        </a>
        <nav
          className="desktop-nav"
          aria-label={language === 'en' ? 'Main navigation' : 'Hoofdnavigatie'}
        >
          <a href="#how">{t.nav.how}</a>
          <a href="#control">{t.nav.control}</a>
          <a href="#fit">{t.nav.fit}</a>
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
            href="mailto:info@anamata.ai?subject=Demo%20ANNA"
            onClick={leadOpener('demo')}
            aria-haspopup="dialog"
          >
            {t.nav.demo}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow light">
              <Sparkles size={15} aria-hidden="true" /> {t.eyebrow}
            </p>
            <h1 id="hero-title">{t.heroTitle}</h1>
            <p className="hero-body">{t.heroBody}</p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="mailto:info@anamata.ai?subject=Demo%20ANNA"
                onClick={leadOpener('demo')}
                aria-haspopup="dialog"
              >
                {t.bookDemo}
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
            <a className="scroll-cue" href="#how">
              <ArrowDown size={15} aria-hidden="true" /> {t.scroll}
            </a>
          </div>

          <div
            className="hero-visual"
            ref={heroRef}
            data-in-view={heroHasEntered}
          >
            <figure className="cleared-day" aria-label={t.day.aria}>
              <figcaption className="day-header">
                <div className="calendar-controls">
                  <span className="today-chip">{t.day.today}</span>
                  <span className="calendar-chevrons" aria-hidden="true">
                    ‹&nbsp;&nbsp;›
                  </span>
                  <span>
                    <CalendarDays size={16} aria-hidden="true" /> {t.day.date}
                  </span>
                </div>
                <span className="calendar-view">{t.day.view}</span>
              </figcaption>
              <div className="day-column-header">
                <span>{t.day.weekday}</span>
                <i aria-hidden="true" />
              </div>
              <div className="day-body">
                <div className="time-rail" aria-hidden="true">
                  <span>08:00</span>
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                  <span>16:00</span>
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
                          style={
                            {
                              '--event-start': `${(segment.start / 540) * 100}%`,
                              '--event-duration': `${(segment.duration / 540) * 100}%`,
                            } as CSSProperties
                          }
                        >
                          <small>{segment.time}</small>
                          <span>{segment.label[language]}</span>
                        </div>
                      ))}
                  </div>
                  <div className="events-layer" aria-hidden="true">
                    {t.day.tasks.map((task) => (
                      <div
                        className="calendar-event"
                        key={task.label}
                        data-incoming={task.incoming}
                        style={
                          {
                            '--event-start': `${(task.start / 540) * 100}%`,
                            '--event-duration': `${(task.duration / 540) * 100}%`,
                          } as CSSProperties
                        }
                      >
                        <small>{task.time}</small>
                        <span>{task.label}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="focus-block focus-anchor"
                    style={
                      {
                        '--event-start': `${(anchorSegment.start / 540) * 100}%`,
                        '--event-duration': `${(anchorSegment.duration / 540) * 100}%`,
                      } as CSSProperties
                    }
                  >
                    <div className="anchor-compact" aria-hidden="true">
                      <small>{focusTime}</small>
                      <span>{anchorSegment.label[language]}</span>
                    </div>
                    <div className="anchor-expanded">
                      <span className="focus-dot" aria-hidden="true" />
                      <small className="anchor-time">{focusTime}</small>
                      <strong>{t.day.focus}</strong>
                      <span className="anchor-detail">{t.day.focusDetail}</span>
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
                  <small>{t.day.handled}</small>
                  <strong>
                    <Check size={13} aria-hidden="true" />
                    {t.day.handledCount}
                  </strong>
                </div>
                <span className="returned-time">
                  <small>{t.day.returned}</small>
                  {t.day.returnedAmount}
                </span>
              </div>
              <div className="reduced-motion-story">
                <span>{t.day.before}</span>
                <ChevronRight size={15} aria-hidden="true" />
                <strong>{t.day.after}</strong>
              </div>
            </figure>
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
          <div className="task-examples">
            <div className="task-examples-heading">
              <p className="eyebrow">{t.examplesKicker}</p>
              <h3>{t.examplesTitle}</h3>
            </div>
            <div className="task-group-grid">
              {t.taskGroups.map((group) => (
                <article className="task-group" key={group.title}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.examples.map((example) => (
                      <li key={example}>
                        <Check size={14} aria-hidden="true" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="workflow-section"
          aria-labelledby="workflow-title"
          ref={workflowRef}
          data-in-view={workflowHasEntered}
        >
          <div className="workflow-heading">
            <p className="eyebrow light">{t.workflowKicker}</p>
            <h2 id="workflow-title">{t.workflowTitle}</h2>
            <p>{t.workflowIntro}</p>
          </div>
          <div className="scenario-shell">
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
          <div className="control-list">
            {t.controlPoints.map((point, index) => (
              <div key={point} className="control-point">
                <span>0{index + 1}</span>
                <p>{point}</p>
                <Check size={19} aria-hidden="true" />
              </div>
            ))}
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

        <section className="fit-section" id="fit" aria-labelledby="fit-title">
          <div className="fit-copy">
            <p className="eyebrow">{t.fitKicker}</p>
            <h2 id="fit-title">{t.fitTitle}</h2>
            <p>{t.fitBody}</p>
          </div>
          <div className="integration-panel">
            <p className="integration-panel-label">{t.integrationLabel}</p>
            <IntegrationGroup
              label={t.available}
              note={t.availableNote}
              integrations={availableIntegrations}
            />
            <IntegrationGroup
              label={t.shipping}
              note={t.shippingNote}
              integrations={shippingIntegrations[language]}
              muted
            />

            <div className="channel-roadmap">
              <div className="integration-group-heading">
                <span>{t.roadmap}</span>
                <p>{t.roadmapNote}</p>
              </div>
              <div className="channel-route">
                <div className="channel-node current">
                  <Image
                    src="/brands/microsoft-teams.svg"
                    alt=""
                    width={30}
                    height={30}
                  />
                  <strong>Microsoft Teams</strong>
                </div>
                <span aria-hidden="true">→</span>
                <div className="channel-node roadmap-node">
                  <Image
                    src="/brands/slack.svg"
                    alt=""
                    width={30}
                    height={30}
                  />
                  <strong>Slack</strong>
                </div>
              </div>
            </div>

            <div className="ecosystem-card">
              <span className="ecosystem-badge">{t.examples}</span>
              <h3>{t.scaleTitle}</h3>
              <p>{t.scaleBody}</p>
              <div className="ecosystem-logos">
                {ecosystemExamples.map((integration) => (
                  <div key={integration.name} title={integration.name}>
                    <Image
                      src={integration.icon}
                      alt=""
                      width={28}
                      height={28}
                    />
                    <span>{integration.name}</span>
                  </div>
                ))}
                <span className="more-systems" aria-label={t.scaleTitle}>
                  +∞
                </span>
              </div>

              <div className="custom-connector">
                <FileCheck2 size={21} aria-hidden="true" />
                <div>
                  <strong>{t.customTitle}</strong>
                  <p>{t.customBody}</p>
                </div>
                <a href="mailto:info@anamata.ai?subject=Connector%20request%20for%20Anna">
                  <span>{t.requestConnector}</span>
                  <small>{t.connectorNote}</small>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <p className="eyebrow light">{t.ctaKicker}</p>
          <h2 id="cta-title">{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <div className="cta-actions">
            <a
              className="button button-primary"
              href="mailto:info@anamata.ai?subject=Demo%20ANNA"
              onClick={leadOpener('demo')}
              aria-haspopup="dialog"
            >
              {t.ctaPrimary}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              className="text-link"
              href="mailto:info@anamata.ai"
              onClick={leadOpener('contact')}
              aria-haspopup="dialog"
            >
              {t.ctaSecondary}
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
          <span className="brand-name">ANNA</span>
        </a>
        <div className="footer-copy">
          <strong>{t.footerLine}</strong>
          <p>{t.transparency}</p>
          <p>
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

function IntegrationGroup({
  label,
  note,
  integrations,
  muted = false,
}: {
  label: string;
  note: string;
  integrations: readonly { name: string; icon: string }[];
  muted?: boolean;
}) {
  return (
    <div className={`integration-group ${muted ? 'coming-group' : ''}`}>
      <div className="integration-group-heading">
        <span>{label}</span>
        <p>{note}</p>
      </div>
      <div className="integration-grid">
        {integrations.map((integration) => (
          <div className="integration-card" key={integration.name}>
            <Image src={integration.icon} alt="" width={28} height={28} />
            <span>{integration.name}</span>
          </div>
        ))}
      </div>
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
