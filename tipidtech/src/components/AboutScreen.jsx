// AboutScreen.jsx
// About page (handoff 1.5). Public route: shown inside AppLayout when logged in,
// standalone (own top bar + call to action) when not. Copy lives in data/aboutContent.js.
//
// Layout: mint hero with the Plan/Track/Understand steps → data (tiles) beside
// who-can-see-it (ink panel) → numbers (split bars beside status meanings) →
// team + contact side by side. Everything stacks to one column on phones.

import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, Info, Users, MessageCircle, ExternalLink, ArrowRight,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { ABOUT } from '../data/aboutContent';
import { STATUS } from '../utils/constants';

// Status meaning per DESIGN.md §3: icon + word + color, word stays ink for contrast.
const STATUS_CHIP = {
  [STATUS.GREEN]:  { icon: CheckCircle2,  word: 'On track', iconCls: 'text-green-600', borderCls: 'border-green-200' },
  [STATUS.YELLOW]: { icon: AlertTriangle, word: 'Careful',  iconCls: 'text-amber-500', borderCls: 'border-amber-200' },
  [STATUS.RED]:    { icon: XCircle,       word: 'At risk',  iconCls: 'text-red-600',   borderCls: 'border-red-200' },
};

const cardCls = 'min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6';
const linkCls =
  'inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-ink underline underline-offset-2 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function Heading({ eyebrow, children }) {
  return (
    <div className="flex flex-col gap-1">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-muted">{eyebrow}</p>}
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{children}</h2>
    </div>
  );
}

function IconBubble({ icon: Icon, className = 'bg-brand/30 text-ink' }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export default function AboutScreen({ loggedIn }) {
  const { hero, data, access, numbers, team, contact, cta } = ABOUT;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:gap-14">
      {!loggedIn && (
        <header className="flex items-center justify-between gap-3">
          <Link to="/login" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <img src="/logo-mark.png" alt="TipidTech home" className="h-10 w-auto max-w-[120px] object-contain" />
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-ink no-underline transition-colors duration-150 hover:bg-gray-50"
          >
            Log in
          </Link>
        </header>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-brand px-5 py-8 sm:px-10 sm:py-12">
        {/* decorative circles, behind content */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/25" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-brand-dark/30" aria-hidden="true" />

        <div className="relative flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">{hero.title}</h1>
          <p className="max-w-2xl text-base font-medium text-ink/80 sm:text-lg">{hero.description}</p>
          <p className="max-w-2xl text-sm text-ink sm:text-base">{hero.intro}</p>
        </div>

        <ol className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {hero.steps.map((step, i) => (
            <li key={step.title} className="flex min-w-0 gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <IconBubble icon={step.icon} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">
                  <span className="text-muted">{i + 1}.</span> {step.title}
                </p>
                <p className="mt-0.5 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="relative mt-5 flex gap-2 text-sm text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {hero.note}
        </p>
      </section>

      {/* ── Data + who can see it ────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Heading eyebrow={data.eyebrow}>{data.heading}</Heading>
        <div className="grid gap-4 lg:grid-cols-5">
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:col-span-3">
            {data.items.map((item) => (
              <li key={item.label} className={`${cardCls} flex gap-3 !p-4 sm:last:odd:col-span-2`}>
                <IconBubble icon={item.icon} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-0.5 text-sm text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex min-w-0 flex-col gap-5 rounded-2xl bg-ink p-5 text-white shadow-sm sm:p-6 lg:col-span-2">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{access.heading}</h3>
            <ul className="flex flex-col gap-4">
              {access.items.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <IconBubble icon={item.icon} className="bg-white/10 text-brand" />
                  <p className="min-w-0 text-sm text-white/80">
                    <span className="font-semibold text-white">{item.label}</span> {item.text}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-auto border-t border-white/15 pt-4 text-sm text-white/70">{access.note}</p>
          </div>
        </div>
      </section>

      {/* ── Numbers ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Heading eyebrow={numbers.eyebrow}>{numbers.heading}</Heading>
        <p className="max-w-3xl text-sm text-ink sm:text-base">{numbers.intro}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-ink">{numbers.splitHeading}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {numbers.split.map((c) => (
                <li key={c.key} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 break-words text-ink">
                      <CategoryIcon category={c.key} className="h-4 w-4 shrink-0 text-muted" />
                      {c.label}
                    </span>
                    <span className="shrink-0 font-bold text-ink">{c.pct}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-page" aria-hidden="true">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${c.share * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-ink">{numbers.statusHeading}</h3>
            <ul className="mt-4 flex flex-col gap-4">
              {numbers.statuses.map(({ key, text }) => {
                const { icon: Icon, word, iconCls, borderCls } = STATUS_CHIP[key];
                return (
                  <li key={key} className="flex flex-col gap-2 xs:flex-row xs:items-center xs:gap-3">
                    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-sm font-semibold text-ink ${borderCls}`}>
                      <Icon className={`h-4 w-4 ${iconCls}`} aria-hidden="true" />
                      {word}
                    </span>
                    <span className="min-w-0 text-sm text-muted">{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="flex gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          {numbers.note}
        </p>
      </section>

      {/* ── Team + contact ───────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardCls} flex gap-3`}>
          <IconBubble icon={Users} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{team.heading}</h2>
            <p className="mt-1 text-sm text-muted">{team.text}</p>
          </div>
        </div>
        <div className={`${cardCls} flex gap-3`}>
          <IconBubble icon={MessageCircle} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{contact.heading}</h2>
            <dl className="mt-2 flex flex-col gap-1">
              {contact.items.map(({ label, value, href }) => {
                const external = href?.startsWith('http');
                return (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</dt>
                    <dd className="min-w-0 break-all text-sm text-ink">
                      {href ? (
                        <a
                          href={href}
                          {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                          className={`${linkCls} font-medium`}
                        >
                          {value}
                          {external && (
                            <>
                              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                              <span className="sr-only">(opens in a new tab)</span>
                            </>
                          )}
                        </a>
                      ) : (
                        <span className="flex min-h-11 items-center">{value}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {!loggedIn && (
          <section className="flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <h2 className="text-lg font-bold text-ink">{cta.heading}</h2>
            <Link
              to="/login"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-ink no-underline transition-colors duration-150 hover:bg-brand-dark sm:w-auto"
            >
              {cta.button}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </section>
      )}
    </div>
  );
}
