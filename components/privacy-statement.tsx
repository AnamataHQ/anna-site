'use client';

import { ArrowLeft, Languages } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useEffect, useState } from 'react';

// Privacy statement for anamata.ai and the ANNA site (Taiga #418). It lives
// here because only this site handles form data itself; anamata.ai links to it.
// When anamata.ai gets a form of its own, the statement moves there.
// The language comes from the link (#en or #nl), so the form and the footer
// open it in the language the visitor was reading.

type Language = 'en' | 'nl';

const MAIL = 'info@anamata.ai';

const mail = <a href={`mailto:${MAIL}`}>{MAIL}</a>;

const CHROME = {
  en: {
    other: 'Nederlands',
    switchLabel: 'Schakel naar Nederlands',
    back: 'Back to the ANNA site',
    title: 'Privacy statement',
  },
  nl: {
    other: 'English',
    switchLabel: 'Switch to English',
    back: 'Terug naar de ANNA-site',
    title: 'Privacyverklaring',
  },
} as const;

const STATEMENT: Record<Language, ReactNode> = {
  en: (
    <>
      <p className="privacy-updated">Last updated: 16 October 2026</p>

      <h2>Who we are</h2>
      <p>
        This statement covers anamata.ai and the ANNA site
        (anna-site.anamata.ai), websites of Anamata BV, registered at Gang 2,
        4031 JH Ingen, the Netherlands, with its visiting address at Europalaan
        93, 3526 KP Utrecht (Chamber of Commerce 78520185). Anamata is
        responsible for processing your personal data on these sites. You can
        read more about Anamata at <a href="https://anamata.eu">anamata.eu</a>.
      </p>

      <h2>When you visit</h2>
      <p>
        We use no tracking cookies and no analytics services, and an ordinary
        visit loads no fonts or scripts from other parties. Our server keeps no
        log of visits.
      </p>
      <p>
        On the ANNA site, to know how you reached us, your browser remembers the
        page you came from, any campaign codes in the link (UTM) and the page
        you landed on, for as long as the tab is open. This stays in your
        browser; we only receive it if you send the form.
      </p>

      <h2>When you send a request</h2>
      <p>
        If you book a demo or contact us through the form on the ANNA site, we
        process:
      </p>
      <ul>
        <li>your name, work email address, organisation and message;</li>
        <li>
          the kind of request (demo or contact) and the language of the site;
        </li>
        <li>
          how you reached the site: the referring page, campaign codes in the
          link (UTM) and the page you landed on.
        </li>
      </ul>
      <p>
        We use this only to answer your request and to see which channels people
        find us through. The legal basis is your own request and our legitimate
        interest in knowing where requests come from. We will not send you
        newsletters or marketing without your consent.
      </p>
      <p>
        Your request reaches us by email at {mail}. Our server keeps a copy for
        90 days, after which it is deleted automatically. In our mailbox we keep
        the request for up to 12 months after our last contact, unless it leads
        to a customer relationship.
      </p>
      <p>
        The request and quote forms on anamata.ai send nothing themselves: they
        open a new mail in your own mail program. If you send it, we receive it
        like any other mail and keep it in our mailbox for the same 12 months.
      </p>

      <h2>Spam protection</h2>
      <p>
        To protect the form on the ANNA site from spam we use Cloudflare
        Turnstile. It loads only when you open the form, and looks at your IP
        address and technical characteristics of your browser to tell whether
        you are human. Turnstile sets no tracking cookies. The legal basis is
        our legitimate interest in keeping the site secure. Cloudflare is a US
        company; the transfer is covered by the EU-US Data Privacy Framework.
      </p>

      <h2>Who processes your data</h2>
      <p>We do not sell your data. These parties process it on our behalf:</p>
      <ul>
        <li>
          TransIP (Netherlands): the server the sites and the form run on;
        </li>
        <li>mijndomein (Netherlands): email for anamata.ai;</li>
        <li>Cloudflare: spam protection for the form.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask us to access, correct or delete your data, to restrict its
        processing, or object to it. Email {mail}; we reply within one month. If
        you disagree with how we handle your data, you can complain to the Dutch
        Data Protection Authority (
        <a href="https://autoriteitpersoonsgegevens.nl">
          Autoriteit Persoonsgegevens
        </a>
        ).
      </p>

      <h2>Changes</h2>
      <p>
        If what we process changes, we update this statement. The date at the
        top shows when that last happened.
      </p>
    </>
  ),
  nl: (
    <>
      <p className="privacy-updated">Laatst bijgewerkt: 16 oktober 2026</p>

      <h2>Wie we zijn</h2>
      <p>
        Deze verklaring geldt voor anamata.ai en de ANNA-site
        (anna-site.anamata.ai), websites van Anamata BV, statutair gevestigd aan
        Gang 2, 4031 JH Ingen, met bezoekadres Europalaan 93, 3526 KP Utrecht
        (KvK 78520185). Anamata is verantwoordelijk voor de verwerking van je
        persoonsgegevens op deze sites. Meer over Anamata lees je op{' '}
        <a href="https://anamata.eu">anamata.eu</a>.
      </p>

      <h2>Als je de site bezoekt</h2>
      <p>
        We gebruiken geen trackingcookies en geen analysediensten, en we laden
        geen lettertypen of scripts van andere partijen bij een gewoon bezoek.
        Onze server houdt geen logboek bij van bezoeken.
      </p>
      <p>
        Op de ANNA-site onthoudt je browser zolang het tabblad open is hoe je
        bij ons kwam: de pagina waar je vandaan kwam, campagnecodes in de link
        (UTM) en de pagina waarop je binnenkwam. Dat blijft in je
        browser; wij ontvangen het alleen als je het formulier verstuurt.
      </p>

      <h2>Als je een aanvraag doet</h2>
      <p>
        Vraag je via het formulier op de ANNA-site een demo aan of neem je
        contact op, dan verwerken we:
      </p>
      <ul>
        <li>je naam, zakelijk e-mailadres, organisatie en je bericht;</li>
        <li>het soort aanvraag (demo of contact) en de taal van de site;</li>
        <li>
          hoe je op de site kwam: de verwijzende pagina, campagnecodes in de
          link (UTM) en de pagina waarop je binnenkwam.
        </li>
      </ul>
      <p>
        We gebruiken deze gegevens alleen om je aanvraag te beantwoorden en om
        te zien via welke kanalen mensen ons vinden. De grondslag is je eigen
        verzoek en ons gerechtvaardigd belang om bij te houden waar aanvragen
        vandaan komen. We sturen je geen nieuwsbrieven of marketing zonder je
        toestemming.
      </p>
      <p>
        Je aanvraag komt per mail binnen bij {mail}. Op onze server bewaren we
        een kopie 90 dagen; daarna wordt die automatisch verwijderd. In onze
        mailbox bewaren we de aanvraag tot 12 maanden na het laatste contact,
        tenzij er een klantrelatie uit voortkomt.
      </p>
      <p>
        De aanvraag- en offerteformulieren op anamata.ai versturen zelf niets:
        ze openen een nieuwe mail in je eigen mailprogramma. Verstuur je die,
        dan ontvangen we hem als gewone mail en bewaren we hem even lang in onze
        mailbox, tot 12 maanden.
      </p>

      <h2>Spambescherming</h2>
      <p>
        Om het formulier op de ANNA-site te beschermen tegen spam gebruiken we
        Cloudflare Turnstile. Dat laadt pas als je het formulier opent, en kijkt
        daarbij naar je IP-adres en technische kenmerken van je browser om te
        bepalen of je een mens bent. Turnstile plaatst geen trackingcookies. De
        grondslag is ons gerechtvaardigd belang om de site veilig te houden.
        Cloudflare is een Amerikaans bedrijf; doorgifte valt onder het
        EU-VS-gegevensprivacykader.
      </p>

      <h2>Wie je gegevens verwerkt</h2>
      <p>
        We verkopen je gegevens niet. Deze partijen verwerken ze in onze
        opdracht:
      </p>
      <ul>
        <li>
          TransIP (Nederland): de server waarop de sites en het formulier
          draaien;
        </li>
        <li>mijndomein (Nederland): de mail van anamata.ai;</li>
        <li>Cloudflare: de spambescherming van het formulier.</li>
      </ul>

      <h2>Je rechten</h2>
      <p>
        Je kunt ons vragen je gegevens in te zien, te corrigeren of te
        verwijderen, de verwerking te beperken, of bezwaar te maken. Mail
        daarvoor naar {mail}; we reageren binnen een maand. Ben je het niet eens
        met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de{' '}
        <a href="https://autoriteitpersoonsgegevens.nl">
          Autoriteit Persoonsgegevens
        </a>
        .
      </p>

      <h2>Wijzigingen</h2>
      <p>
        Als we iets veranderen aan wat we verwerken, passen we deze verklaring
        aan. De datum bovenaan laat zien wanneer dat voor het laatst gebeurde.
      </p>
    </>
  ),
};

export function PrivacyStatement() {
  const [language, setLanguage] = useState<Language>('en');
  const t = CHROME[language];

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === '#nl') setLanguage('nl');
      if (window.location.hash === '#en') setLanguage('en');
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = () => {
    const next = language === 'en' ? 'nl' : 'en';
    window.history.replaceState(null, '', `#${next}`);
    setLanguage(next);
  };

  return (
    <main className="privacy-page">
      <header className="site-header privacy-header">
        {/* Plain links: the site is static files, so there is nothing to prefetch. */}
        {/* oxlint-disable-next-line next/no-html-link-for-pages */}
        <a className="brand" href="/" aria-label={t.back}>
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
        <div className="header-actions">
          <button
            className="language-switch"
            type="button"
            onClick={switchLanguage}
            aria-label={t.switchLabel}
          >
            <Languages size={16} aria-hidden="true" />
            {t.other}
          </button>
        </div>
      </header>

      <article className="privacy-body" id="main-content">
        <h1>{t.title}</h1>
        {STATEMENT[language]}
        <p className="privacy-back">
          {/* oxlint-disable-next-line next/no-html-link-for-pages */}
          <a href="/">
            <ArrowLeft size={15} aria-hidden="true" />
            {t.back}
          </a>
        </p>
      </article>
    </main>
  );
}
