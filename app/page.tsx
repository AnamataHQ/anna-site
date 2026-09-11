'use client';

import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Languages,
  LockKeyhole,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    heroTitle: 'The work still needs doing. It does not need to take your time.',
    heroBody:
      'Anna takes care of repetitive coordination and administration for small and mid-sized organisations. She answers, prepares and acts, while your team stays in control.',
    bookDemo: 'Book a demo',
    contact: 'Contact Anamata',
    scroll: 'See how she works',
    sculptureAlt:
      'An abstract workflow moving from incoming documents through context and approval to a completed result.',
    stages: ['Request', 'Context', 'Approval', 'Done'],
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
    workflowKicker: 'One request, from start to finish',
    workflowTitle: 'A leave request, handled.',
    workflowIntro:
      'A colleague asks a simple question in Microsoft Teams. Anna turns it into completed work without losing the human decision point.',
    demoLabel: 'DEMO · NOT THE LIVE RECORD',
    message: 'Can I take next Friday off?',
    timeline: [
      {
        title: 'A request arrives',
        body: 'Anna understands the question in Microsoft Teams and identifies what is needed next.',
        status: 'Received',
      },
      {
        title: 'Anna prepares the work',
        body: 'She gathers the relevant context from connected systems such as ClockWise and Loket.',
        status: 'Prepared',
      },
      {
        title: 'You stay in control',
        body: 'When a decision or approval is required, Anna pauses and presents a clear next step.',
        status: 'Approval needed',
      },
      {
        title: 'Anna completes and reports',
        body: 'After approval, she completes the action and reports the outcome back in Teams.',
        status: 'Completed',
      },
    ],
    approvalTitle: 'Ready for approval',
    approvalBody: 'Leave request checked. The next step is prepared and waiting for your decision.',
    approve: 'Approve',
    record: 'A clear record remains',
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
    fitKicker: 'Fits into the workday',
    fitTitle: 'Works where your team already works.',
    fitBody:
      'Anna meets colleagues in Microsoft Teams and works with the operational systems behind it. No new destination for people to remember. Less switching, chasing and copying.',
    integrationLabel: 'Connected work surfaces',
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
    heroTitle: 'Het werk moet nog steeds gebeuren. Het hoeft niet jouw tijd te kosten.',
    heroBody:
      'Anna neemt terugkerende afstemming en administratie over voor kleine en middelgrote organisaties. Ze beantwoordt, bereidt voor en voert uit, terwijl jouw team de regie houdt.',
    bookDemo: 'Plan een demo',
    contact: 'Neem contact op',
    scroll: 'Bekijk hoe ze werkt',
    sculptureAlt:
      'Een abstract werkproces dat van binnenkomende documenten via context en goedkeuring naar een afgerond resultaat loopt.',
    stages: ['Verzoek', 'Context', 'Goedkeuring', 'Klaar'],
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
    workflowKicker: 'Eén verzoek, van begin tot eind',
    workflowTitle: 'Een verlofaanvraag, geregeld.',
    workflowIntro:
      'Een collega stelt een eenvoudige vraag in Microsoft Teams. Anna maakt er afgerond werk van, zonder het menselijke beslismoment over te slaan.',
    demoLabel: 'DEMO · NOT THE LIVE RECORD',
    message: 'Kan ik volgende vrijdag vrij nemen?',
    timeline: [
      {
        title: 'Een verzoek komt binnen',
        body: 'Anna begrijpt de vraag in Microsoft Teams en bepaalt wat er nodig is voor de volgende stap.',
        status: 'Ontvangen',
      },
      {
        title: 'Anna bereidt het werk voor',
        body: 'Ze verzamelt de relevante context uit gekoppelde systemen zoals ClockWise en Loket.',
        status: 'Voorbereid',
      },
      {
        title: 'Jij houdt de regie',
        body: 'Wanneer een besluit of goedkeuring nodig is, pauzeert Anna en legt ze de volgende stap helder voor.',
        status: 'Goedkeuring nodig',
      },
      {
        title: 'Anna rondt af en rapporteert',
        body: 'Na goedkeuring voert ze de actie uit en meldt ze het resultaat terug in Teams.',
        status: 'Afgerond',
      },
    ],
    approvalTitle: 'Klaar voor goedkeuring',
    approvalBody: 'Verlofaanvraag gecontroleerd. De volgende stap staat klaar voor jouw besluit.',
    approve: 'Goedkeuren',
    record: 'Er blijft een duidelijk verslag achter',
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
    fitKicker: 'Past in de werkdag',
    fitTitle: 'Werkt waar jouw team al werkt.',
    fitBody:
      'Anna ontmoet collega’s in Microsoft Teams en werkt met de operationele systemen daarachter. Geen nieuwe bestemming om te onthouden. Minder wisselen, najagen en overtypen.',
    integrationLabel: 'Gekoppelde werkomgevingen',
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

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const t = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = () => {
    setLanguage((current) => (current === 'en' ? 'nl' : 'en'));
  };

  return (
    <main>
      <a className="skip-link" href="#main-content">
        {language === 'en' ? 'Skip to content' : 'Ga naar inhoud'}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Anna by Anamata, home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-name">ANNA</span>
          <span className="brand-by">by anamata.ai</span>
        </a>

        <nav className="desktop-nav" aria-label={language === 'en' ? 'Main navigation' : 'Hoofdnavigatie'}>
          <a href="#how">{t.nav.how}</a>
          <a href="#control">{t.nav.control}</a>
          <a href="#fit">{t.nav.fit}</a>
        </nav>

        <div className="header-actions">
          <button className="language-switch" type="button" onClick={switchLanguage} aria-label={`Switch to ${t.otherLanguage}`}>
            <Languages size={16} aria-hidden="true" />
            {t.otherLanguage}
          </button>
          <a className="header-cta" href="mailto:info@anamata.ai?subject=Demo%20ANNA">
            {t.nav.demo}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow light"><Sparkles size={15} aria-hidden="true" /> {t.eyebrow}</p>
            <h1 id="hero-title">{t.heroTitle}</h1>
            <p className="hero-body">{t.heroBody}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="mailto:info@anamata.ai?subject=Demo%20ANNA">
                {t.bookDemo}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-ghost" href="mailto:info@anamata.ai">{t.contact}</a>
            </div>
            <a className="scroll-cue" href="#how"><ArrowDown size={15} aria-hidden="true" /> {t.scroll}</a>
          </div>

          <div className="hero-visual" aria-label={t.sculptureAlt} role="img">
            <div className="visual-halo" />
            <img src="/anna-workflow.png" alt="" width="1586" height="992" />
            <div className="stage-labels" aria-hidden="true">
              {t.stages.map((stage, index) => (
                <span key={stage} className={index === 2 ? 'approval-stage' : ''}>
                  <small>0{index + 1}</small>{stage}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="capability-section" id="how" aria-labelledby="capability-title">
          <div className="section-intro">
            <div><p className="eyebrow">{t.problemKicker}</p><h2 id="capability-title">{t.problemTitle}</h2></div>
            <p>{t.problemBody}</p>
          </div>

          <div className="capability-grid">
            {t.capabilities.map((capability) => (
              <article className="capability-card" key={capability.number}>
                <div className="capability-number">{capability.number}</div>
                <div><h3>{capability.title}</h3><p>{capability.body}</p></div>
                <ChevronRight aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" aria-labelledby="workflow-title">
          <div className="workflow-heading">
            <p className="eyebrow light">{t.workflowKicker}</p>
            <h2 id="workflow-title">{t.workflowTitle}</h2>
            <p>{t.workflowIntro}</p>
          </div>

          <div className="workflow-demo">
            <div className="demo-window">
              <div className="demo-toolbar">
                <div className="demo-dots" aria-hidden="true"><span /><span /><span /></div>
                <span>{t.demoLabel}</span>
              </div>
              <div className="demo-thread">
                <div className="message-row">
                  <div className="avatar person" aria-hidden="true">Y</div>
                  <div className="message-bubble">{t.message}</div>
                </div>
                <div className="message-row anna-row">
                  <div className="avatar anna" aria-hidden="true">A</div>
                  <div className="anna-status-card">
                    <div className="status-line"><CircleCheck size={18} aria-hidden="true" /><strong>{t.approvalTitle}</strong></div>
                    <p>{t.approvalBody}</p>
                    <button type="button" className="approve-button" aria-label={t.approve}>
                      <Check size={16} aria-hidden="true" /> {t.approve}
                    </button>
                  </div>
                </div>
                <div className="record-line"><LockKeyhole size={15} aria-hidden="true" /> {t.record}</div>
              </div>
            </div>

            <ol className="timeline">
              {t.timeline.map((step, index) => (
                <li key={step.title}>
                  <div className="timeline-marker"><span>0{index + 1}</span></div>
                  <div className="timeline-copy">
                    <div className="timeline-title-row"><h3>{step.title}</h3><small>{step.status}</small></div>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="control-section" id="control" aria-labelledby="control-title">
          <div className="control-statement">
            <p className="eyebrow light">{t.controlKicker}</p>
            <h2 id="control-title">{t.controlTitle}</h2>
            <p>{t.controlBody}</p>
          </div>
          <div className="control-list">
            {t.controlPoints.map((point, index) => (
              <div key={point} className="control-point"><span>0{index + 1}</span><p>{point}</p><Check size={19} aria-hidden="true" /></div>
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
            <p>{t.integrationLabel}</p>
            <div className="integration-stack">
              <div className="integration-card teams"><MessageSquareText aria-hidden="true" /><span>Microsoft Teams</span></div>
              <div className="connector-line" aria-hidden="true"><span /><span /><span /></div>
              <div className="back-office">
                <div className="integration-card"><span className="integration-initial">C</span><span>ClockWise</span></div>
                <div className="integration-card"><span className="integration-initial">L</span><span>Loket</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <p className="eyebrow light">{t.ctaKicker}</p>
          <h2 id="cta-title">{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <div className="cta-actions">
            <a className="button button-primary" href="mailto:info@anamata.ai?subject=Demo%20ANNA">{t.ctaPrimary}<ArrowRight size={18} aria-hidden="true" /></a>
            <a className="text-link" href="mailto:info@anamata.ai">{t.ctaSecondary}<ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </section>
      </div>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">A</span><span className="brand-name">ANNA</span></a>
        <div className="footer-copy"><strong>{t.footerLine}</strong><p>{t.transparency}</p></div>
        <a href="https://anamata.ai">anamata.ai <ArrowRight size={15} aria-hidden="true" /></a>
      </footer>
    </main>
  );
}
