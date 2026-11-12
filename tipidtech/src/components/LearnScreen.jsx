// LearnScreen.jsx
// Learn page (handoff 1.6): a reading list of free money resources.
// Read only for now; a Read/Practice switcher waits for a 2.5 spec.

import { ExternalLink } from 'lucide-react';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';
import { READING_LIST } from '../data/readingList';

export default function LearnScreen() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        as="h1"
        title="Learn"
        description="Free reading on budgeting, saving and staying safe with money."
      />

      <p className="text-xs text-muted">
        General learning material, not professional financial advice. Links open other websites.
      </p>

      <ul className="flex flex-col gap-4">
        {READING_LIST.map((item) => (
          <li key={item.id}>
            <Card>
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <p className="mt-0.5 text-xs text-muted">{item.author}</p>
              <p className="mt-3 text-sm text-ink">{item.summary}</p>
              <p className="mt-2 text-sm text-ink">
                <span className="font-semibold">Why it helps: </span>
                {item.whyItHelps}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-ink underline underline-offset-2 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.linkLabel}
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
