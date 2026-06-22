import Link from 'next/link';
import styles from '../styles/Layout.module.css';

export default function Header() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sentiment-analysis-iq.vercel.app";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoLink}>
          <span className={styles.logoMark}>SA</span>
          <span className={styles.logoText}>SentimentIQ</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Analyze</Link>
          <a
            href={`${backendUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            API Docs ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
