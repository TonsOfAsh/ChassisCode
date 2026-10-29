import Link from 'next/link';

/** The frame for the plain text pages (About, Privacy): wordmark, back link, body. */
export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="page info-page">
      <header className="masthead">
        <Link href="/" className="wordmark wordmark-link">
          ChassisCode
        </Link>
        <Link href="/" className="info-back">
          ← Back to the game
        </Link>
      </header>
      <article className="info">
        <h2 className="info-title">{title}</h2>
        {children}
      </article>
      <SiteFooter />
    </main>
  );
}

/** The links at the foot of every page. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/about">About</Link>
      <span aria-hidden="true">·</span>
      <Link href="/privacy">Privacy</Link>
    </footer>
  );
}
