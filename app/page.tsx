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
import { useEffect, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Language = 'en' | 'nl';

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
      focus: 'Work that needs you',
      focusDetail: 'Strategy · decisions · people',
      tasks: ['Follow-ups', 'Leave request', 'Update records'],
      handled: 'Handled by Anna',
      returned: 'Time returned',
      returnedAmount: '2h 40m',
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
      'Anna meets colleagues in Microsoft Teams and works with the operational systems behind it. Start with the connections you use today and add more as your workflows grow.',
    integrationLabel: 'Your connected workday',
    available: 'Available now',
    coming: 'On the way',
    availableNote: 'The work surfaces Anna can connect with today.',
    comingNote: 'A growing connector landscape, shaped around your workflows.',
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
      focus: 'Werk dat jou nodig heeft',
      focusDetail: 'Strategie · besluiten · mensen',
      tasks: ['Opvolging', 'Verlofaanvraag', 'Dossiers bijwerken'],
      handled: 'Afgehandeld door Anna',
      returned: 'Tijd terug',
      returnedAmount: '2u 40m',
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
      'Anna ontmoet collega’s in Microsoft Teams en werkt met de operationele systemen daarachter. Begin met de koppelingen die je vandaag gebruikt en voeg toe wanneer je werkprocessen groeien.',
    integrationLabel: 'Jouw verbonden werkdag',
    available: 'Nu beschikbaar',
    coming: 'Onderweg',
    availableNote: 'De werkomgevingen waarmee Anna vandaag kan verbinden.',
    comingNote:
      'Een groeiend landschap van koppelingen, gevormd rond jouw werkprocessen.',
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

const comingIntegrations = [
  { name: 'Microsoft 365', icon: '/brands/microsoft-365.svg' },
  { name: 'Atlassian', icon: '/brands/atlassian.svg' },
  { name: 'Jira', icon: '/brands/jira.svg' },
  { name: 'Notion', icon: '/brands/notion.svg' },
  { name: 'GitHub', icon: '/brands/github.svg' },
] as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [scenarioId, setScenarioId] = useState('leave');
  const [demoStep, setDemoStep] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const t = content[language];
  const scenario =
    t.scenarios.find((item) => item.id === scenarioId) ?? t.scenarios[0];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReduceMotion(media.matches);
      setDemoStep(media.matches ? 5 : 0);
    };
    const initialUpdate = window.setTimeout(updatePreference, 0);
    media.addEventListener('change', updatePreference);
    return () => {
      window.clearTimeout(initialUpdate);
      media.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused || demoStep >= 4) return;
    const timer = window.setTimeout(() => setDemoStep((step) => step + 1), 920);
    return () => window.clearTimeout(timer);
  }, [demoStep, isPaused, reduceMotion]);

  const switchLanguage = () =>
    setLanguage((current) => (current === 'en' ? 'nl' : 'en'));
  const restartDemo = () => {
    setIsPaused(false);
    setDemoStep(reduceMotion ? 5 : 0);
    setReplayKey((key) => key + 1);
  };
  const changeScenario = (value: string) => {
    setScenarioId(value);
    setIsPaused(false);
    setDemoStep(reduceMotion ? 5 : 0);
  };

  return (
    <main>
      <a className="skip-link" href="#main-content">
        {language === 'en' ? 'Skip to content' : 'Ga naar inhoud'}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Anna by Anamata, home">
          <span className="brand-mark" aria-hidden="true">
            A
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
              >
                {t.bookDemo}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-ghost" href="mailto:info@anamata.ai">
                {t.contact}
              </a>
            </div>
            <a className="scroll-cue" href="#how">
              <ArrowDown size={15} aria-hidden="true" /> {t.scroll}
            </a>
          </div>

          <div className="hero-visual">
            <figure className="cleared-day" aria-label={t.day.aria}>
              <figcaption className="day-header">
                <span>
                  <CalendarDays size={16} aria-hidden="true" /> {t.day.date}
                </span>
                <span className="returned-time">
                  <small>{t.day.returned}</small>
                  {t.day.returnedAmount}
                </span>
              </figcaption>
              <div className="day-body">
                <div className="time-rail" aria-hidden="true">
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                </div>
                <div className="calendar-grid">
                  <div className="focus-block">
                    <span className="focus-dot" aria-hidden="true" />
                    <strong>{t.day.focus}</strong>
                    <small>{t.day.focusDetail}</small>
                  </div>
                  <div className="admin-task task-one">
                    <span>{t.day.tasks[0]}</span>
                  </div>
                  <div className="admin-task task-two">
                    <span>{t.day.tasks[1]}</span>
                  </div>
                  <div className="admin-task task-three">
                    <span>{t.day.tasks[2]}</span>
                  </div>
                  <div className="anna-tray">
                    <span className="anna-tray-mark" aria-hidden="true">
                      A
                    </span>
                    <div>
                      <small>{t.day.handled}</small>
                      {t.day.tasks.map((task) => (
                        <span key={task}>
                          <Check size={12} aria-hidden="true" />
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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

        <section className="workflow-section" aria-labelledby="workflow-title">
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
                  <span className="teams-mini" aria-hidden="true">
                    T
                  </span>
                  <strong>{t.demoChannel}</strong>
                </div>
                <span>{t.demoLabel}</span>
              </div>
              <div className="demo-thread" aria-live="polite">
                <DemoMessage visible={demoStep >= 0} avatar="Y" kind="person">
                  <p>{scenario.person}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 1} avatar="A" kind="anna">
                  <p>{scenario.answer}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 2} avatar="A" kind="anna">
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
                <DemoMessage visible={demoStep >= 4} avatar="A" kind="anna">
                  <div className="approval-card">
                    <div className="approval-kicker">
                      <UserRoundCheck size={16} aria-hidden="true" />
                      {demoStep >= 5 ? t.approved : t.approvalGate}
                    </div>
                    <p>{scenario.approval}</p>
                    <button
                      type="button"
                      className="approve-button"
                      onClick={() => setDemoStep(5)}
                      disabled={demoStep >= 5}
                    >
                      <Check size={16} aria-hidden="true" />{' '}
                      {demoStep >= 5 ? t.approved : t.approve}
                    </button>
                  </div>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 5} avatar="A" kind="anna">
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
            <div className="connector-path" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
            <IntegrationGroup
              label={t.coming}
              note={t.comingNote}
              integrations={comingIntegrations}
              muted
            />
            <a
              className="connector-request"
              href="mailto:info@anamata.ai?subject=Connector%20request%20for%20Anna"
            >
              <span>
                <FileCheck2 size={18} aria-hidden="true" />
                <strong>{t.requestConnector}</strong>
                <small>{t.connectorNote}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
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
            >
              {t.ctaPrimary}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="text-link" href="mailto:info@anamata.ai">
              {t.ctaSecondary}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">A</span>
          <span className="brand-name">ANNA</span>
        </a>
        <div className="footer-copy">
          <strong>{t.footerLine}</strong>
          <p>{t.transparency}</p>
        </div>
        <a href="https://anamata.ai">
          anamata.ai <ArrowRight size={15} aria-hidden="true" />
        </a>
      </footer>
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
  avatar: string;
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
        {avatar}
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
