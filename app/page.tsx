'use client';

import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleCheck,
  Clock,
  Contact,
  FileText,
  Folder,
  GitBranch,
  KeyRound,
  Languages,
  Library,
  LockKeyhole,
  type LucideIcon,
  Mail,
  MessagesSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  SendHorizontal,
  ShieldCheck,
  SquareKanban,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { AnnaMark, type AnnaMarkState } from '@/components/anna-mark';
import { captureLandingSource, LeadFormDialog } from '@/components/lead-form';
import { ClearedDay, type DayCopy } from '@/components/cleared-day';
import type { LeadKind } from '@/lib/lead-capture';
import { ANAMATA_LINKEDIN_URL } from '@/lib/site-links';

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
    heroTitle: 'Your agenda. Finally decluttered.',
    heroBody:
      'Ask her in Teams or Slack. She does the recurring work in your systems, asks before she acts, and reports back.',
    trust: 'Now in early access · 2026',
    heroNote: 'Reply within two working days.',
    facts: [
      'Works inside Microsoft Teams and Slack',
      'Connects to the systems you already use',
      'Asks before she acts, within the rights you grant',
    ],
    day: {
      aria: 'A working day where Anna clears routine administration and gives focus time back.',
      date: 'Tuesday · 18 June',
      view: 'Work week',
      today: 'Today',
      weekday: 'TUE 18',
      focus: 'Work that needs you',
      focusDetail: 'Strategy · decisions · people',
      handled: 'Handled by Anna',
      handledCount: '7 routine tasks completed',
      replay: 'Replay',
      before: 'Before · 7 routine tasks split up the day',
      after: 'After · 08:00–17:00 for work that needs you',
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
    } satisfies DayCopy,
    connectorsKicker: 'Every system the work lives in',
    connectorsTitle: 'Anna connects to the systems you already use.',
    connectorsBody:
      'Connect Anna to the systems your work lives in, and she can read and act in them. You decide which rights she gets.',
    ringLabel: 'Among thousands of connectors',
    ringAria:
      "A paper disc with Anna's mark, with twelve smaller paper discs pinned around it, each with the mark and name of one system, and a paper thread from Anna's disc to every one of them. A few threads run on past the edge of the picture.",
    customBody:
      'If it has a workable API, Anamata can build a connector for it during onboarding.',
    requestConnector: 'Request a connector',
    problemKicker: 'How Anna works',
    problemTitle: 'One request in Teams. Finished work in your systems.',
    problemBody:
      'Anna picks up the request, gathers what she needs from your systems, asks when something is missing and does the work. You see exactly what she did. Anna can remind you and the team on a schedule, every Friday or every month-end. She works from your own policies and handbook, and how your team does things is set up together with your admin.',
    contrastTitle: 'A chatbot tells you how. Anna does it, in your systems.',
    contrastBody:
      'Writing tools draft the email and leave the rest to you. Anna writes the hours in your time tracking, files the leave in your HR system and logs the follow-up on the deal. Only with the rights your admin gave her, and with a record of every action. You keep the tools you have. Anna finishes the admin in them.',
    capabilities: [
      {
        number: '01',
        title: 'You ask',
        body: 'In Teams or Slack, in your own words. No new tool to learn.',
      },
      {
        number: '02',
        title: 'Anna prepares',
        body: 'She collects the context from your systems, checks the rules and asks you when a decision is needed.',
      },
      {
        number: '03',
        title: 'Anna finishes',
        body: 'She does the approved work in the system itself and reports back what she did.',
      },
    ],
    examplesKicker: 'Where to start',
    examplesTitle: 'Three things to hand to Anna first.',
    watchThisOne: 'Watch this one',
    examples: [
      {
        tray: 1,
        scenario: 'week',
        title: 'Hours in your time tracking',
        ask: 'Log my hours for this week.',
        outcome:
          'Anna fills the week from your calendar and projects, shows you the sheet and submits it once you say so.',
      },
      {
        tray: 2,
        scenario: 'leave',
        title: 'Leave in your HR system',
        ask: 'Can I take next Friday off?',
        outcome:
          'Anna checks your balance and the policy, prepares the request and files it after your approval.',
      },
      {
        tray: 3,
        scenario: 'follow-up',
        title: 'Follow-ups in your CRM',
        ask: 'Which customers are due a follow-up this week?',
        outcome:
          'Anna lists the open follow-ups on your deals, drafts them and logs what was sent.',
      },
    ],
    workflowKicker: 'One request, from start to finish',
    workflowTitle: 'Watch the work happen.',
    workflowIntro:
      'A colleague asks in Microsoft Teams or Slack. Anna gathers what she needs, does the work, asks when a decision is yours, and reports back in the same conversation.',
    demoLabel: 'EXAMPLE · NOT A LIVE RECORD',
    demoChannel: 'Teams · Slack · Anna',
    working: 'Anna is working',
    ready: 'Checked',
    executing: 'Anna is carrying this out…',
    replay: 'Replay conversation',
    pause: 'Pause conversation',
    resume: 'Resume conversation',
    chooseSituation: 'Choose a situation',
    demoHint:
      'Choose a situation. The conversation plays once, then waits for your reply.',
    record: 'What Anna did',
    scenarios: [
      {
        id: 'week',
        label: 'Close my week',
        who: 'Joris',
        person:
          'Close my week. Same split as last week, except Thursday was all on the Rotterdam migration.',
        answer:
          'On it. I’ll build the sheet from last week’s split and Thursday’s tickets, then show you before I submit.',
        steps: [
          'Read last week’s hoursheet: 3 projects, 40 h',
          'Pulled Thursday’s tickets on the Rotterdam migration: 4 tickets, 8 h',
          'Drafted week 43: 38 h across 3 projects',
          'Compared with your usual week: Wednesday afternoon is 2 h short',
        ],
        sources: ['Time tracking', 'Ticket board'],
        question:
          'Week 43 is ready: 38 h over 3 projects. Wednesday 14:00–16:00 is empty. Shall I book those 2 h on the Rotterdam migration as well and submit the week for approval?',
        reply: 'Yes, and submit it.',
        result:
          'Submitted. Week 43 is with your manager for approval. If it’s still open on Friday at 16:00, I’ll remind you both here.',
        record: [
          'Hoursheet week 43 written: 40 h',
          'Submitted for approval',
          'Reminder set: Friday 16:00',
        ],
      },
      {
        id: 'leave',
        label: 'A week off',
        who: 'Mila',
        person: 'I’d like 10 to 14 November off. Can you arrange it?',
        answer:
          'Let me check your balance and the team first, then I’ll file it.',
        steps: [
          'Leave balance: 14 days left, 5 needed',
          'Leave policy: requests over 3 days need 2 weeks’ notice, you’re at 2 weeks and 1 day',
          'Team calendar: nobody else from your team is off that week',
          'Your manager for approval: Esther',
        ],
        sources: ['HR system', 'Leave policy', 'Time tracking'],
        question:
          'All clear: 5 days, 9 left afterwards, no overlap with the team. Shall I file the request with Esther and block the week in time tracking?',
        reply: 'Please do.',
        result:
          'Filed. Esther has the request, and 10 to 14 November are booked as leave in time tracking so your week closes clean. I’ll tell you here when she approves.',
        record: [
          'Leave request filed: 10–14 Nov, 5 days',
          'Absence booked in time tracking',
          'Watching for approval',
        ],
      },
      {
        id: 'month-end',
        label: 'Month-end hours',
        who: 'Femke',
        person:
          'Who hasn’t submitted October yet? Chase them for me, I need it closed by Friday.',
        answer:
          'I’ll check the overview, nudge everyone who’s behind, and report back Friday morning.',
        steps: [
          'Overview for October: 34 of 41 people submitted',
          '7 open: 4 missing days, 3 not submitted at all',
          'Sent each of the 7 a personal nudge with what’s missing',
          'Scheduled a follow-up for Thursday and a report for Friday 9:00',
        ],
        sources: ['Time tracking', 'Team directory'],
        question:
          'Two of them are out this week, Tom and Lisa. Shall I ask their manager to submit for them, or wait until they’re back?',
        reply: 'Ask their manager.',
        result:
          'Done. Marco has both sheets to submit. Friday 9:00 you get the list of who’s still open; so far 5 of 7 have replied.',
        record: [
          '7 nudges sent',
          'Request to Marco: 2 sheets',
          'Report scheduled: Friday 9:00',
        ],
      },
      {
        id: 'onboarding',
        label: 'New colleague',
        who: 'Femke',
        person:
          'Sanne starts Monday as a developer on the Rotterdam team. Set up what you can and tell me what needs me.',
        answer:
          'I’ll run the onboarding checklist from the handbook and come back with what’s done and what’s yours.',
        steps: [
          'Onboarding checklist from the handbook: 11 items',
          'Requested accounts: code repository, ticket board, wiki',
          'Added Sanne to the Rotterdam team channel, active from Monday 9:00',
          'Booked the welcome lunch and set first-week reminders for her buddy, Joris',
          'Shared the onboarding guide from the wiki',
        ],
        sources: [
          'Handbook',
          'Code repository',
          'Ticket board',
          'Wiki',
          'Teams',
        ],
        question:
          '8 of 11 done. The laptop order, the office badge and the contract signature are yours. Shall I open those three tasks for you with Friday as the deadline?',
        reply: 'Yes, do that.',
        result:
          'Done. Three tasks are on your board with Friday as the deadline, and Sanne’s first day is ready. I’ll check on Monday that her accounts are active.',
        record: [
          '3 account requests sent',
          'Channel, lunch and reminders set',
          '3 tasks opened for Femke, due Friday',
          'Monday check scheduled',
        ],
      },
      {
        id: 'follow-up',
        label: 'Customer follow-ups',
        who: 'Daan',
        person:
          'Which customer follow-ups are still open this week? Draft them for me.',
        answer:
          'I’ll go through this week’s deal notes and draft one message per open promise.',
        steps: [
          'Read this week’s notes on 12 active deals',
          'Found 4 open promises: a quote, two documents and a call',
          'Drafted 4 follow-ups in your tone, with the file each customer is waiting for attached where we have it',
          'Logged each promise as a task on its deal',
        ],
        sources: ['CRM', 'Mail'],
        question:
          'Four drafts are ready below. The quote for Van Dijk Logistics needs a price from you first. Shall I send the other three now and remind you about the quote tomorrow at 9:00?',
        reply: 'Send them, remind me tomorrow.',
        result:
          'Sent three, logged on their deals. The Van Dijk quote is on your list for tomorrow 9:00 with the draft ready.',
        record: [
          '3 follow-ups sent and logged',
          '4 tasks on deals',
          'Reminder: tomorrow 9:00',
        ],
      },
    ],
    controlKicker: 'Initiative, with boundaries',
    controlTitle: 'Anna can move work forward. You decide how far.',
    controlBody:
      'Your admin decides, per person or per role, which systems Anna may use and what she may do in them. Anna works within that, asks when a judgement is yours, and leaves a record of every completed action.',
    boundaryCards: [
      {
        title: 'Anna does',
        body: 'Collects what is needed, prepares the work and carries out the actions you have allowed.',
      },
      {
        title: 'Anna asks',
        body: 'When something is missing, when a call is yours to make, when she is not sure, or when an action cannot be undone.',
      },
      {
        title: 'Anna never',
        body: 'Takes a decision that is yours, goes beyond the access your admin gave her, or acts without leaving a record.',
      },
      {
        title: 'Access is set by your admin',
        body: 'Per person or per role. A licence never gives Anna more than your admin granted.',
      },
    ],
    controlFacts: [
      'Rights per system, set by your admin',
      'Every completed action in a record',
      'Sends every message in her own name, never as you',
    ],
    controlPrivacy:
      'What you discuss with Anna stays yours. Your colleagues have their own Anna and do not see your requests, your hours or your leave.',
    controlExample: [
      {
        sender: 'colleague',
        text: 'Can you move last week’s Tuesday hours from the Rotterdam project to the Utrecht one?',
      },
      {
        sender: 'anna',
        text: 'Last week has 6 h on Rotterdam on Tuesday. That week is already approved, so moving them changes an approved sheet and your manager sees a correction. That call is yours. Shall I move the 6 h and resubmit the week?',
      },
      { sender: 'colleague', text: 'Yes, do it.' },
      {
        sender: 'anna',
        text: 'Done. Week resubmitted with the correction; it is in the record.',
      },
    ],
    faqTitle: 'Questions and answers',
    faq: [
      {
        q: 'Is Anna a chatbot?',
        a: 'No. You talk to her in Teams or Slack, but the work happens in your systems: she writes the hours, files the leave, logs the follow-up. A chat window gives you text. Anna gives you a finished task and a record of it.',
      },
      {
        q: 'Which systems does she work in today?',
        a: 'Today: ClockWise, Claim a Seat, Notion and HubSpot, plus systems with a standard sign-in. Loket and Microsoft 365 follow soon. Anything else with a workable API can follow: Anamata builds the connection during onboarding, with no developer needed on your side.',
      },
      {
        q: 'Who decides what Anna may access and do?',
        a: 'Your admin, per person or per role, per system. Your admin adds Anna to Teams or Slack through the Microsoft 365 admin centre or the Slack settings: a short configuration that needs their approval. They can cut a connection or switch Anna off at any moment; the record of what she did stays.',
      },
      {
        q: 'Which AI is behind Anna, and who can see our data?',
        a: 'The model setup behind Anna is agreed with your company; Anamata manages it, and your admin’s rights apply to everything Anna reads or does. Your data is not used to train models, not by Anamata and not by the model providers we contract. In group chats Anna reads along by default so she can pick up requests; she says so when she is added, and any group can switch that off. Your IT or security lead can ask us anything before a single system is connected; we answer in writing.',
      },
      {
        q: 'Can my colleagues see what I ask Anna?',
        a: 'No. Each person has their own Anna. Colleagues do not see your requests, your hours or your leave. What lands in a shared system, such as a submitted hoursheet, follows that system’s own rights, as it does today.',
      },
      {
        q: 'What happens when she is wrong or unsure, and where do I see what she did?',
        a: 'She shows her work before anything is submitted, says so when she is unsure, and tells you plainly when a task is outside what she can do. Every completed action is in the record, for you and for your admin.',
      },
      {
        q: 'Does she work in Dutch?',
        a: 'Yes. Ask her in Dutch or English; she answers in the language you use.',
      },
      {
        q: 'What does early access involve, and what does Anna cost?',
        a: 'You tell us which recurring tasks eat your team’s week. We reply within two working days, go through those tasks with you and show how Anna would take them on. Together we decide whether she is a fit and where she starts. Pricing is agreed per company during early access and shared with you before anything is connected.',
      },
    ],
    ctaKicker: 'Now in early access · 2026',
    ctaTitle: 'Show us the tasks that keep getting in the way.',
    ctaBody:
      'Anna is in early access. We are starting with a small group of companies. Tell us which recurring tasks eat your team’s week. We reply within two working days, go through those tasks with you and show how Anna would take them on.',
    ctaSteps: [
      'You name the tasks',
      'We go through them with you and show how Anna handles them',
      'Together we decide whether Anna is a fit, and where she starts',
    ],
    ctaAsk:
      'What we ask of you: a conversation, and one person who knows the work.',
    ctaGet:
      'What you get: a clear view of what Anna would do in your week, before anything is connected.',
    footerLine:
      'Anna is built in the Netherlands by Anamata, a quality engineering and testing company from Utrecht.',
    footerLinks: {
      contact: 'Contact',
      linkedin: 'LinkedIn',
      site: 'anamata.ai',
    },
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
    heroTitle: 'Jouw agenda. Eindelijk opgeruimd.',
    heroBody:
      'Vraag het haar in Teams of Slack. Ze doet het terugkerende werk in jouw systemen, vraagt voordat ze handelt en koppelt terug.',
    trust: 'Nu in vroege toegang · 2026',
    heroNote: 'Antwoord binnen twee werkdagen.',
    facts: [
      'Werkt in Microsoft Teams en Slack',
      'Koppelt met de systemen die je al gebruikt',
      'Vraagt voordat ze handelt, binnen de rechten die jij geeft',
    ],
    day: {
      aria: 'Een werkdag waarin Anna routineadministratie afhandelt en focustijd teruggeeft.',
      date: 'Dinsdag · 18 juni',
      view: 'Werkweek',
      today: 'Vandaag',
      weekday: 'DI 18',
      focus: 'Werk dat jou nodig heeft',
      focusDetail: 'Strategie · besluiten · mensen',
      handled: 'Afgehandeld door Anna',
      handledCount: '7 routinetaken afgerond',
      replay: 'Opnieuw afspelen',
      before: 'Voor · 7 routinetaken versnipperen de dag',
      after: 'Na · 08:00–17:00 voor werk dat jou nodig heeft',
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
    } satisfies DayCopy,
    connectorsKicker: 'Elk systeem waar het werk in staat',
    connectorsTitle: 'Anna verbindt met de systemen die je al gebruikt.',
    connectorsBody:
      'Koppel Anna aan de systemen waar je werk in staat, en ze kan erin lezen en handelen. Jij bepaalt welke rechten ze krijgt.',
    ringLabel: 'Een greep uit duizenden koppelingen',
    ringAria:
      "Een papieren schijf met het merk van Anna, met daaromheen twaalf kleinere papieren schijfjes, elk met het merk en de naam van één systeem, en een papieren draad van Anna's schijf naar elk schijfje. Een paar draden lopen door tot voorbij de rand van het beeld.",
    customBody:
      'Als het een werkbare API heeft, kan Anamata er tijdens de onboarding een koppeling voor bouwen.',
    requestConnector: 'Vraag een koppeling aan',
    problemKicker: 'Zo werkt Anna',
    problemTitle: 'Eén vraag in Teams. Afgerond werk in jouw systemen.',
    problemBody:
      'Anna pakt je vraag op, haalt op wat ze nodig heeft uit je systemen, vraagt als iets ontbreekt en doet het werk. Je ziet precies wat ze heeft gedaan. Anna kan jou en het team op een vast moment herinneren, elke vrijdag of elke maandafsluiting. Ze werkt vanuit jullie eigen beleid en handboek, en hoe jullie team het doet wordt samen met je beheerder ingesteld.',
    contrastTitle:
      'Een chatbot vertelt je hoe. Anna doet het, in jouw systemen.',
    contrastBody:
      'Schrijfhulpen maken de mail en laten de rest aan jou. Anna boekt de uren in je urenregistratie, dient het verlof in je HR-systeem in en legt de opvolging vast op de deal. Alleen met de rechten die je beheerder haar gaf, en met een verslag van elke actie. Je houdt de programma’s die je hebt. Anna maakt de administratie erin af.',
    capabilities: [
      {
        number: '01',
        title: 'Jij vraagt',
        body: 'In Teams of Slack, in je eigen woorden. Geen nieuw programma om te leren.',
      },
      {
        number: '02',
        title: 'Anna bereidt voor',
        body: 'Ze verzamelt de context uit je systemen, controleert de regels en vraagt het jou als er een beslissing nodig is.',
      },
      {
        number: '03',
        title: 'Anna rondt af',
        body: 'Ze doet het goedgekeurde werk in het systeem zelf en koppelt terug wat ze heeft gedaan.',
      },
    ],
    examplesKicker: 'Om mee te beginnen',
    examplesTitle: 'Drie taken om meteen aan Anna te geven.',
    watchThisOne: 'Bekijk deze',
    examples: [
      {
        tray: 1,
        scenario: 'week',
        title: 'Uren in je urenregistratie',
        ask: 'Boek mijn uren voor deze week.',
        outcome:
          'Anna vult de week vanuit je agenda en projecten, laat je het overzicht zien en dient het in zodra jij dat zegt.',
      },
      {
        tray: 2,
        scenario: 'leave',
        title: 'Verlof in je HR-systeem',
        ask: 'Kan ik volgende vrijdag vrij nemen?',
        outcome:
          'Anna controleert je saldo en het beleid, bereidt de aanvraag voor en dient hem in na jouw goedkeuring.',
      },
      {
        tray: 3,
        scenario: 'follow-up',
        title: 'Opvolging in je CRM',
        ask: 'Welke klanten zijn deze week aan opvolging toe?',
        outcome:
          'Anna zet de openstaande opvolgingen uit je deals op een rij, schrijft ze en legt vast wat is verstuurd.',
      },
    ],
    workflowKicker: 'Eén verzoek, van begin tot eind',
    workflowTitle: 'Zie hoe het werk gebeurt.',
    workflowIntro:
      'Een collega vraagt iets in Microsoft Teams of Slack. Anna verzamelt wat ze nodig heeft, doet het werk, vraagt het jou als een beslissing van jou is en koppelt terug in hetzelfde gesprek.',
    demoLabel: 'VOORBEELD · GEEN ECHT DOSSIER',
    demoChannel: 'Teams · Slack · Anna',
    working: 'Anna is bezig',
    ready: 'Gecontroleerd',
    executing: 'Anna voert dit nu uit…',
    replay: 'Gesprek opnieuw afspelen',
    pause: 'Gesprek pauzeren',
    resume: 'Gesprek hervatten',
    chooseSituation: 'Kies een situatie',
    demoHint:
      'Kies een situatie. Het gesprek speelt één keer af en wacht dan op jouw antwoord.',
    record: 'Wat Anna heeft gedaan',
    scenarios: [
      {
        id: 'week',
        label: 'Mijn week afsluiten',
        who: 'Joris',
        person:
          'Sluit mijn week af. Zelfde verdeling als vorige week, behalve donderdag: die ging helemaal naar de Rotterdam-migratie.',
        answer:
          'Doe ik. Ik maak de staat op basis van de verdeling van vorige week en de tickets van donderdag, en laat hem zien voordat ik hem indien.',
        steps: [
          'Urenstaat van vorige week gelezen: 3 projecten, 40 u',
          'Tickets van donderdag op de Rotterdam-migratie opgehaald: 4 tickets, 8 u',
          'Week 43 opgezet: 38 u over 3 projecten',
          'Vergeleken met je gebruikelijke week: woensdagmiddag komt 2 u tekort',
        ],
        sources: ['Urenregistratie', 'Ticketbord'],
        question:
          'Week 43 staat klaar: 38 u over 3 projecten. Woensdag 14:00–16:00 is leeg. Zal ik die 2 u ook op de Rotterdam-migratie boeken en de week ter goedkeuring indienen?',
        reply: 'Ja, en dien hem in.',
        result:
          'Ingediend. Week 43 ligt bij je manager ter goedkeuring. Staat hij vrijdag om 16:00 nog open, dan herinner ik jullie hier allebei.',
        record: [
          'Urenstaat week 43 geschreven: 40 u',
          'Ter goedkeuring ingediend',
          'Herinnering gezet: vrijdag 16:00',
        ],
      },
      {
        id: 'leave',
        label: 'Een week vrij',
        who: 'Mila',
        person:
          'Ik wil graag 10 tot en met 14 november vrij. Kun jij dat regelen?',
        answer: 'Ik kijk eerst naar je saldo en het team, dan dien ik het in.',
        steps: [
          'Verlofsaldo: 14 dagen over, 5 nodig',
          'Verlofbeleid: aanvragen langer dan 3 dagen minimaal 2 weken vooraf, je zit op 2 weken en 1 dag',
          'Teamkalender: niemand anders uit je team is die week vrij',
          'Je manager voor de goedkeuring: Esther',
        ],
        sources: ['HR-systeem', 'Verlofbeleid', 'Urenregistratie'],
        question:
          'Alles klopt: 5 dagen, daarna 9 over, geen overlap met het team. Zal ik de aanvraag bij Esther indienen en de week in de urenregistratie blokkeren?',
        reply: 'Graag.',
        result:
          'Ingediend. Esther heeft de aanvraag, en 10 tot en met 14 november staan als verlof in de urenregistratie, zodat je week netjes sluit. Ik meld het hier zodra ze goedkeurt.',
        record: [
          'Verlofaanvraag ingediend: 10–14 nov, 5 dagen',
          'Afwezigheid geboekt in urenregistratie',
          'Wacht op goedkeuring',
        ],
      },
      {
        id: 'month-end',
        label: 'Maandafsluiting',
        who: 'Femke',
        person:
          'Wie heeft oktober nog niet ingediend? Jaag ze voor me op, ik wil het vrijdag dicht hebben.',
        answer:
          'Ik check het overzicht, por iedereen die achterloopt en meld me vrijdagochtend terug.',
        steps: [
          'Overzicht oktober: 34 van de 41 mensen hebben ingediend',
          '7 open: 4 missen dagen, 3 hebben niets ingediend',
          'Alle 7 een persoonlijk berichtje gestuurd met wat er ontbreekt',
          'Opvolging gepland voor donderdag en een rapport voor vrijdag 9:00',
        ],
        sources: ['Urenregistratie', 'Personeelsoverzicht'],
        question:
          'Twee van hen zijn deze week afwezig, Tom en Lisa. Zal ik hun manager vragen om voor hen in te dienen, of wachten tot ze terug zijn?',
        reply: 'Vraag hun manager.',
        result:
          'Gedaan. Marco heeft beide staten om in te dienen. Vrijdag 9:00 krijg je de lijst van wie nog openstaat; tot nu toe hebben 5 van de 7 gereageerd.',
        record: [
          '7 berichtjes gestuurd',
          'Verzoek aan Marco: 2 staten',
          'Rapport gepland: vrijdag 9:00',
        ],
      },
      {
        id: 'onboarding',
        label: 'Nieuwe collega',
        who: 'Femke',
        person:
          'Sanne begint maandag als developer in het Rotterdam-team. Regel wat je kunt en zeg me wat ik zelf moet doen.',
        answer:
          'Ik loop de onboardingchecklist uit het handboek af en kom terug met wat klaar is en wat van jou is.',
        steps: [
          'Onboardingchecklist uit het handboek: 11 punten',
          'Accounts aangevraagd: coderepository, ticketbord, wiki',
          'Sanne toegevoegd aan het Rotterdam-kanaal, actief vanaf maandag 9:00',
          'Welkomstlunch geboekt en herinneringen voor de eerste week gezet voor haar buddy, Joris',
          'Onboardinggids uit de wiki gedeeld',
        ],
        sources: ['Handboek', 'Coderepository', 'Ticketbord', 'Wiki', 'Teams'],
        question:
          '8 van de 11 klaar. De laptopbestelling, de toegangspas en de handtekening onder het contract zijn voor jou. Zal ik die drie taken voor je aanmaken met vrijdag als deadline?',
        reply: 'Ja, doe dat.',
        result:
          'Gedaan. Drie taken staan op je bord met vrijdag als deadline, en Sannes eerste dag is voorbereid. Maandag controleer ik of haar accounts actief zijn.',
        record: [
          '3 accountaanvragen verstuurd',
          'Kanaal, lunch en herinneringen geregeld',
          '3 taken aangemaakt voor Femke, deadline vrijdag',
          'Controle gepland: maandag',
        ],
      },
      {
        id: 'follow-up',
        label: 'Klantopvolging',
        who: 'Daan',
        person:
          'Welke klantopvolgingen staan deze week nog open? Schrijf ze alvast.',
        answer:
          'Ik ga door de dealnotities van deze week en schrijf per open belofte één bericht.',
        steps: [
          'Notities van deze week gelezen op 12 actieve deals',
          '4 open beloftes gevonden: een offerte, twee documenten en een belafspraak',
          '4 opvolgingen geschreven in jouw toon, met het stuk waar de klant op wacht erbij waar we het hebben',
          'Elke belofte als taak op de deal gezet',
        ],
        sources: ['CRM', 'Mail'],
        question:
          'Vier concepten staan hieronder klaar. De offerte voor Van Dijk Logistics heeft eerst een prijs van jou nodig. Zal ik de andere drie nu versturen en je morgen om 9:00 aan de offerte herinneren?',
        reply: 'Versturen, en herinner me morgen.',
        result:
          'Drie verstuurd en op hun deals gelogd. De offerte voor Van Dijk staat morgen 9:00 op je lijst, met het concept klaar.',
        record: [
          '3 opvolgingen verstuurd en gelogd',
          '4 taken op deals',
          'Herinnering: morgen 9:00',
        ],
      },
    ],
    controlKicker: 'Initiatief, met grenzen',
    controlTitle: 'Anna kan werk vooruitbrengen. Jij bepaalt hoe ver.',
    controlBody:
      'Je beheerder bepaalt per persoon of per rol welke systemen Anna mag gebruiken en wat ze erin mag doen. Daarbinnen werkt Anna, vraagt ze het jou als een oordeel van jou is, en laat ze van elke afgeronde actie een verslag achter.',
    boundaryCards: [
      {
        title: 'Anna doet',
        body: 'Verzamelen wat nodig is, het werk voorbereiden en de acties uitvoeren die jij hebt toegestaan.',
      },
      {
        title: 'Anna vraagt',
        body: 'Als iets ontbreekt, als een keuze aan jou is, als ze het niet zeker weet, of als een actie niet terug te draaien is.',
      },
      {
        title: 'Anna doet nooit',
        body: 'Een besluit nemen dat van jou is, verder gaan dan de toegang die je beheerder gaf, of handelen zonder een verslag achter te laten.',
      },
      {
        title: 'Toegang stelt je beheerder in',
        body: 'Per persoon of per rol. Een licentie geeft Anna nooit meer dan je beheerder heeft toegestaan.',
      },
    ],
    controlFacts: [
      'Rechten per systeem, ingesteld door je beheerder',
      'Elke afgeronde actie in een verslag',
      'Verstuurt elk bericht onder haar eigen naam, nooit als jij',
    ],
    controlPrivacy:
      'Wat jij met Anna bespreekt, blijft van jou. Je collega’s hebben hun eigen Anna en zien jouw verzoeken, uren of verlof niet.',
    controlExample: [
      {
        sender: 'colleague',
        text: 'Kun je de uren van vorige week dinsdag van het Rotterdam-project naar Utrecht zetten?',
      },
      {
        sender: 'anna',
        text: 'Vorige week staat 6 u op Rotterdam op dinsdag. Die week is al goedgekeurd, dus verplaatsen wijzigt een goedgekeurde staat en je manager ziet een correctie. Die keuze is aan jou. Zal ik de 6 u verplaatsen en de week opnieuw indienen?',
      },
      { sender: 'colleague', text: 'Ja, doe maar.' },
      {
        sender: 'anna',
        text: 'Gedaan. Week opnieuw ingediend met de correctie; het staat in het verslag.',
      },
    ],
    faqTitle: 'Vragen en antwoorden',
    faq: [
      {
        q: 'Is Anna een chatbot?',
        a: 'Nee. Je praat met haar in Teams of Slack, maar het werk gebeurt in jouw systemen: ze boekt de uren, dient het verlof in, legt de opvolging vast. Een chatvenster geeft je tekst. Anna geeft je een afgeronde taak en een verslag ervan.',
      },
      {
        q: 'In welke systemen werkt ze vandaag?',
        a: 'Vandaag: ClockWise, Claim a Seat, Notion en HubSpot, plus systemen met een standaard inlog. Loket en Microsoft 365 volgen binnenkort. Al het andere met een bruikbare API kan volgen: Anamata bouwt de koppeling tijdens de onboarding, zonder dat je er een ontwikkelaar voor nodig hebt.',
      },
      {
        q: 'Wie bepaalt waar Anna bij mag en wat ze mag doen?',
        a: 'Je beheerder, per persoon of per rol, per systeem. Je beheerder voegt Anna toe aan Teams of Slack via het Microsoft 365-beheercentrum of de Slack-instellingen: een korte configuratie waar hun goedkeuring voor nodig is. Ze kunnen een koppeling op elk moment verbreken of Anna uitzetten; het verslag van wat ze deed blijft.',
      },
      {
        q: 'Welke AI zit achter Anna, en wie kan onze gegevens zien?',
        a: 'De modelopstelling achter Anna spreken we met jullie bedrijf af; Anamata beheert die, en de rechten van je beheerder gelden voor alles wat Anna leest of doet. Jullie gegevens worden niet gebruikt om modellen te trainen, niet door Anamata en niet door de modelleveranciers waarmee wij werken. In groepsgesprekken leest Anna standaard mee zodat ze verzoeken kan oppakken; ze zegt dat als ze wordt toegevoegd, en elke groep kan dat uitzetten. Je IT’er of security-verantwoordelijke kan ons alles vragen voordat er één systeem gekoppeld wordt; we antwoorden schriftelijk.',
      },
      {
        q: 'Kunnen mijn collega’s zien wat ik Anna vraag?',
        a: 'Nee. Iedereen heeft een eigen Anna. Collega’s zien jouw verzoeken, uren of verlof niet. Wat in een gedeeld systeem terechtkomt, zoals een ingediende urenstaat, volgt de rechten van dat systeem, net als nu.',
      },
      {
        q: 'Wat gebeurt er als ze het mis heeft of twijfelt, en waar zie ik wat ze deed?',
        a: 'Ze laat haar werk zien voordat iets wordt ingediend, zegt het als ze twijfelt, en zegt eerlijk wanneer een taak buiten haar kunnen valt. Elke afgeronde actie staat in het verslag, voor jou en voor je beheerder.',
      },
      {
        q: 'Werkt ze in het Nederlands?',
        a: 'Ja. Stel je vraag in het Nederlands of Engels; ze antwoordt in de taal die jij gebruikt.',
      },
      {
        q: 'Wat houdt vroege toegang in, en wat kost Anna?',
        a: 'Je vertelt ons welke terugkerende taken de week van je team opslokken. We reageren binnen twee werkdagen, lopen die taken met je door en laten zien hoe Anna ze zou oppakken. Samen bepalen we of ze past en waar ze begint. De prijs spreken we per bedrijf af tijdens de vroege toegang en delen we met je voordat er iets gekoppeld wordt.',
      },
    ],
    ctaKicker: 'Nu in vroege toegang · 2026',
    ctaTitle: 'Laat ons zien welke taken steeds in de weg zitten.',
    ctaBody:
      'Anna is in vroege toegang. We beginnen met een kleine groep bedrijven. Vertel ons welke terugkerende taken de week van je team opslokken. We reageren binnen twee werkdagen, lopen die taken met je door en laten zien hoe Anna ze zou oppakken.',
    ctaSteps: [
      'Jij noemt de taken',
      'We lopen ze met je door en laten zien hoe Anna ze aanpakt',
      'Samen bepalen we of Anna past, en waar ze begint',
    ],
    ctaAsk:
      'Wat we van jou vragen: een gesprek, en één collega die het werk kent.',
    ctaGet:
      'Wat je krijgt: een helder beeld van wat Anna in jouw week zou doen, voordat er iets gekoppeld wordt.',
    footerLine:
      'Anna wordt in Nederland gebouwd door Anamata, een bedrijf voor quality engineering en softwaretesten uit Utrecht.',
    footerLinks: {
      contact: 'Contact',
      linkedin: 'LinkedIn',
      site: 'anamata.ai',
    },
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
// While Anna works, each source in the scenario shows as a generic glyph for
// its kind of system, never a vendor logo; unmapped names get a neutral dot.
const SOURCE_GLYPHS: readonly (readonly [LucideIcon, readonly string[]])[] = [
  [Clock, ['Time tracking', 'Urenregistratie']],
  [SquareKanban, ['Ticket board', 'Ticketbord']],
  [Folder, ['HR system', 'HR-systeem']],
  [FileText, ['Leave policy', 'Verlofbeleid']],
  [Users, ['Team directory', 'Personeelsoverzicht']],
  [BookOpen, ['Handbook', 'Handboek']],
  [GitBranch, ['Code repository', 'Coderepository']],
  [Library, ['Wiki']],
  [MessagesSquare, ['Teams']],
  [Contact, ['CRM']],
  [Mail, ['Mail']],
];

const traySizes = {
  1: { width: 320, height: 217 },
  2: { width: 320, height: 206 },
  3: { width: 320, height: 172 },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [leadKind, setLeadKind] = useState<LeadKind | null>(null);
  const [scenarioId, setScenarioId] = useState('week');
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const executionTimerRef = useRef<number | null>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [heroRef, , heroHasEntered] = useElementVisibility<HTMLDivElement>(0.3);
  const [workflowRef, workflowVisible, workflowHasEntered] =
    useElementVisibility<HTMLElement>(0.28);
  const t = content[language];
  // The step cards in "How Anna works" mirror the first conversation.
  const demo = t.scenarios[0];
  const first = t.examples[0];
  const scenario =
    t.scenarios.find((item) => item.id === scenarioId) ?? t.scenarios[0];
  // Steps of the replay: 0 the ask, 1 Anna's answer, 2 the work card, then one
  // tick per step of work, the question, the reply, the result.
  const questionStep = scenario.steps.length + 4;
  const replyStep = questionStep + 1;
  const doneStep = replyStep + 1;
  const finalStepOf = (id: string) =>
    (t.scenarios.find((item) => item.id === id) ?? t.scenarios[0]).steps
      .length + 6;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // A Dutch link (`?lang=nl`) opens the page in Dutch. The HTML is English
  // first, so it switches once after load.
  useEffect(() => {
    const dutchLink =
      new URLSearchParams(window.location.search).get('lang') === 'nl';
    if (!dutchLink) return;
    const timer = window.setTimeout(() => setLanguage('nl'), 0);
    return () => window.clearTimeout(timer);
  }, []);

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
      if (media.matches) setDemoStep(99);
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
      setDemoStep(reduceMotion ? 99 : 0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [workflowHasEntered, reduceMotion]);

  useEffect(() => {
    if (
      !workflowVisible ||
      reduceMotion ||
      isPaused ||
      demoStep >= questionStep
    )
      return;
    const timer = window.setTimeout(() => setDemoStep((step) => step + 1), 920);
    return () => window.clearTimeout(timer);
  }, [demoStep, isPaused, reduceMotion, workflowVisible, questionStep]);

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

  const switchLanguage = () => {
    const next: Language = language === 'en' ? 'nl' : 'en';
    setLanguage(next);
    const url = new URL(window.location.href);
    if (next === 'nl') url.searchParams.set('lang', 'nl');
    else url.searchParams.delete('lang');
    window.history.replaceState(window.history.state, '', url);
  };
  const restartDemo = () => {
    clearExecutionTimer();
    setIsPaused(false);
    setDemoStep(reduceMotion ? 99 : 0);
    setReplayKey((key) => key + 1);
  };
  const changeScenario = (value: string) => {
    clearExecutionTimer();
    setScenarioId(value);
    setIsPaused(false);
    setDemoStep(reduceMotion ? finalStepOf(value) : 0);
  };
  // A use-case card plays its conversation: select it, bring the demo into
  // view, and put focus on its tab so keyboard users land where it plays.
  const watchScenario = (id: string) => {
    changeScenario(id);
    document.getElementById('demo')?.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    tabRefs.current[id]?.focus({ preventScroll: true });
  };
  // The viewer sends the colleague's reply; Anna works, then reports.
  const sendReply = () => {
    if (demoStep !== questionStep || isExecuting) return;
    setDemoStep(replyStep);
    setIsExecuting(true);
    executionTimerRef.current = window.setTimeout(() => {
      setDemoStep(doneStep);
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
          <AnnaMark size="avatar" />
          <span className="brand-name">Anna</span>
          <span className="brand-by">by anamata.ai</span>
        </a>
        <nav
          className="desktop-nav"
          aria-label={language === 'en' ? 'Main navigation' : 'Hoofdnavigatie'}
        >
          <a href="#how">{t.nav.how}</a>
          <a href="#connectors">{t.nav.connectors}</a>
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
          <div className="hero-copy">
            <p className="eyebrow light hero-eyebrow">
              <Image
                src="/brands/anna-mono-light.svg"
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
            <p className="hero-note">{t.heroNote}</p>
          </div>
          <div
            className="hero-visual"
            ref={heroRef}
            data-in-view={heroHasEntered}
          >
            <ClearedDay
              key={language}
              copy={t.day}
              language={language}
              inView={heroHasEntered}
              reduceMotion={reduceMotion}
            />
          </div>
          <ul className="hero-facts">
            {t.facts.map((fact) => (
              <li key={fact}>
                <Check size={14} aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </section>

        <section
          className="workflow-section"
          id="demo"
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
                  aria-label={t.chooseSituation}
                >
                  {t.scenarios.map((item) => (
                    <TabsTrigger
                      value={item.id}
                      key={item.id}
                      ref={(element: HTMLElement | null) => {
                        tabRefs.current[item.id] = element;
                      }}
                    >
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
                    <span>{t.replay}</span>
                  </button>
                  {!reduceMotion && demoStep < questionStep && (
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
                      <span>{isPaused ? t.resume : t.pause}</span>
                    </button>
                  )}
                </div>
              </div>
            </Tabs>
            <p className="demo-hint">{t.demoHint}</p>

            <div className="demo-window" key={`${scenarioId}-${replayKey}`}>
              <div className="demo-toolbar">
                <div className="demo-channel">
                  <AnnaMark size="avatar" />
                  <strong>{t.demoChannel}</strong>
                </div>
                <span>{t.demoLabel}</span>
              </div>
              <div className="demo-thread" aria-live="polite">
                <DemoMessage
                  visible={demoStep >= 0}
                  kind="person"
                  who={scenario.who}
                >
                  <p>{scenario.person}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 1} kind="anna">
                  <p>{scenario.answer}</p>
                </DemoMessage>
                <DemoMessage visible={demoStep >= 2} kind="anna">
                  <div
                    className="work-card"
                    data-ready={demoStep >= questionStep}
                  >
                    <div className="context-card-title">
                      {demoStep >= questionStep ? (
                        <CircleCheck size={17} aria-hidden="true" />
                      ) : (
                        <Search size={17} aria-hidden="true" />
                      )}
                      <strong>
                        {demoStep >= questionStep ? t.ready : t.working}
                      </strong>
                      {demoStep < questionStep && (
                        <span className="typing-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      )}
                    </div>
                    <ol className="work-steps">
                      {scenario.steps.map((step, index) => (
                        <li
                          key={step}
                          data-visible={demoStep >= 3 + index}
                          data-done={demoStep >= 4 + index}
                        >
                          <Check size={13} aria-hidden="true" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="source-pills">
                      {scenario.sources.map((source) => (
                        <span key={source}>{source}</span>
                      ))}
                    </div>
                  </div>
                </DemoMessage>
                <DemoMessage visible={demoStep >= questionStep} kind="anna">
                  <p>{scenario.question}</p>
                </DemoMessage>
                <div
                  className="reply-row"
                  data-visible={demoStep === questionStep}
                  aria-hidden={demoStep !== questionStep}
                  inert={demoStep !== questionStep}
                >
                  <button
                    type="button"
                    className="reply-button"
                    onClick={sendReply}
                    disabled={isExecuting}
                    aria-busy={isExecuting}
                  >
                    {scenario.reply}
                    <SendHorizontal size={15} aria-hidden="true" />
                  </button>
                </div>
                <DemoMessage
                  visible={demoStep >= replyStep}
                  kind="person"
                  who={scenario.who}
                >
                  <p>{scenario.reply}</p>
                </DemoMessage>
                <DemoMessage
                  visible={demoStep >= replyStep}
                  kind="anna"
                  state={
                    isExecuting
                      ? 'working'
                      : demoStep >= doneStep
                        ? 'done'
                        : 'idle'
                  }
                >
                  {demoStep >= doneStep ? (
                    <div className="result-message">
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <p>{scenario.result}</p>
                    </div>
                  ) : (
                    <>
                      <p className="executing-line">
                        {t.executing}
                        <span className="typing-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      </p>
                      {isExecuting && (
                        <ul className="working-sources">
                          {scenario.sources.map((source) => (
                            <li key={source}>
                              <SourceGlyph source={source} />
                              {source}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </DemoMessage>
                <div
                  className="record-list"
                  data-visible={demoStep >= doneStep}
                  aria-hidden={demoStep < doneStep}
                >
                  <strong>
                    <LockKeyhole size={14} aria-hidden="true" /> {t.record}
                  </strong>
                  <ul>
                    {scenario.record.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <a
            className="text-link demo-cta-link"
            href="mailto:info@anamata.ai?subject=Early%20access%20to%20Anna"
            onClick={leadOpener('demo')}
            aria-haspopup="dialog"
          >
            {t.earlyAccess}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
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
                <button
                  type="button"
                  className="use-case-watch"
                  data-scenario={example.scenario}
                  onClick={() => watchScenario(example.scenario)}
                >
                  <Play size={14} aria-hidden="true" />
                  {t.watchThisOne}
                  <span className="sr-only">
                    {' '}
                    {
                      t.scenarios.find((item) => item.id === example.scenario)
                        ?.label
                    }
                  </span>
                </button>
              </article>
            ))}
          </div>
          <a
            className="button button-ghost use-case-cta"
            href="mailto:info@anamata.ai?subject=Early%20access%20to%20Anna"
            onClick={leadOpener('demo')}
            aria-haspopup="dialog"
          >
            {t.earlyAccess}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>

        <section
          className="capability-section"
          id="how"
          aria-labelledby="capability-title"
        >
          <div className="section-intro">
            <div>
              <AnnaMark size="opener" />
              <p className="eyebrow">{t.problemKicker}</p>
              <h2 id="capability-title">{t.problemTitle}</h2>
            </div>
            <p>{t.problemBody}</p>
          </div>
          <div className="capability-grid">
            {t.capabilities.map((capability, index) => (
              <article className="capability-card" key={capability.number}>
                <div className="capability-number">{capability.number}</div>
                <figure className="capability-artefact" aria-hidden="true">
                  {index === 0 && (
                    <div className="artefact-row">
                      <div className="avatar person">{demo.who[0]}</div>
                      <div className="message-body">
                        <span className="message-who">{demo.who}</span>
                        <div className="message-bubble">{first.ask}</div>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <>
                      <div className="context-card-title">
                        <AnnaMark size="avatar" state="working" />
                        <strong>{t.working}</strong>
                        <span className="typing-dots">
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                      <ul className="working-sources">
                        {demo.sources.map((source) => (
                          <li key={source}>
                            <SourceGlyph source={source} />
                            {source}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {index === 2 && (
                    <div className="artefact-row">
                      <AnnaMark size="avatar" state="done" />
                      <div className="record-list">
                        <strong>
                          <LockKeyhole size={14} /> {t.record}
                        </strong>
                        <ul>
                          {demo.record.slice(1).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </figure>
                <div className="capability-text">
                  <h3>{capability.title}</h3>
                  <p>{capability.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contrast-section" aria-labelledby="contrast-title">
          <h2 id="contrast-title">{t.contrastTitle}</h2>
          <p>{t.contrastBody}</p>
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
                <AnnaMark size="hub" />
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
          className="control-section"
          id="control"
          aria-labelledby="control-title"
        >
          <div className="control-statement">
            <AnnaMark size="opener" />
            <p className="eyebrow light">{t.controlKicker}</p>
            <h2 id="control-title">{t.controlTitle}</h2>
            <p>{t.controlBody}</p>
          </div>
          <figure className="control-example" aria-label={t.demoLabel}>
            <div className="demo-toolbar" aria-hidden="true">
              <span>{t.demoLabel}</span>
            </div>
            <div className="control-thread">
              {t.controlExample.map((m, index) => (
                <div
                  className="control-message"
                  data-sender={m.sender}
                  key={m.text}
                >
                  {m.sender === 'anna' ? (
                    index === t.controlExample.length - 1 ? (
                      <AnnaMark size="avatar" state="done" />
                    ) : (
                      <AnnaMark size="avatar" />
                    )
                  ) : (
                    <div className="avatar person" aria-hidden="true">
                      {demo.who[0]}
                    </div>
                  )}
                  <div className="message-body">
                    <span className="message-who">
                      {m.sender === 'anna' ? 'Anna' : demo.who}
                    </span>
                    <div className="message-bubble">
                      <p>{m.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </figure>
          <div className="boundary-grid">
            {t.boundaryCards.map((card, index) => (
              <article className="boundary-card" key={card.title}>
                {index === 0 ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : index === 1 ? (
                  <UserRoundCheck aria-hidden="true" />
                ) : index === 2 ? (
                  <ShieldCheck aria-hidden="true" />
                ) : (
                  <KeyRound aria-hidden="true" />
                )}
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
          <div className="control-notes">
            <ul className="control-facts">
              {t.controlFacts.map((fact) => (
                <li key={fact}>
                  <Check size={14} aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
            <p className="control-privacy">{t.controlPrivacy}</p>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">{t.faqTitle}</h2>
          <div className="faq-list">
            {t.faq.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <p className="eyebrow">{t.ctaKicker}</p>
          <h2 id="cta-title">{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <ol className="cta-steps">
            {t.ctaSteps.map((step, index) => (
              <li className="cta-step" key={step}>
                <span className="cta-step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {step}
              </li>
            ))}
          </ol>
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
          <p className="cta-note">
            {t.ctaAsk} {t.ctaGet}
          </p>
        </section>
      </div>

      <footer>
        <a className="brand footer-brand" href="#top">
          <AnnaMark size="avatar" />
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
        <div className="footer-links">
          <a
            href="mailto:info@anamata.ai"
            onClick={leadOpener('contact')}
            aria-haspopup="dialog"
          >
            {t.footerLinks.contact}
          </a>
          {ANAMATA_LINKEDIN_URL && (
            <a href={ANAMATA_LINKEDIN_URL} rel="noopener">
              {t.footerLinks.linkedin}
            </a>
          )}
          <a href="https://anamata.ai">
            {t.footerLinks.site} <ArrowRight size={15} aria-hidden="true" />
          </a>
          <button
            className="language-switch"
            type="button"
            onClick={switchLanguage}
            aria-label={`Switch to ${t.otherLanguage}`}
          >
            <Languages size={15} aria-hidden="true" />
            {t.otherLanguage}
          </button>
        </div>
      </footer>

      <LeadFormDialog
        kind={leadKind}
        language={language}
        onClose={() => setLeadKind(null)}
      />
    </main>
  );
}

function SourceGlyph({ source }: { source: string }) {
  const Glyph = SOURCE_GLYPHS.find(([, names]) => names.includes(source))?.[0];
  return Glyph ? (
    <Glyph size={12} aria-hidden="true" />
  ) : (
    <span className="source-dot" aria-hidden="true" />
  );
}

function DemoMessage({
  visible,
  who,
  kind,
  state,
  children,
}: {
  visible: boolean;
  who?: string;
  kind: 'person' | 'anna';
  state?: AnnaMarkState;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`message-row ${kind === 'anna' ? 'anna-row' : ''}`}
      data-visible={visible}
      aria-hidden={!visible}
      inert={!visible}
    >
      {kind === 'anna' ? (
        <AnnaMark size="avatar" state={state} />
      ) : (
        <div className="avatar person" aria-hidden="true">
          {who?.[0]}
        </div>
      )}
      <div className="message-body">
        <span className="message-who">{kind === 'anna' ? 'Anna' : who}</span>
        <div className="message-bubble">{children}</div>
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
