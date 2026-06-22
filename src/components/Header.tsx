import Link from 'next/link';
import styles from '../styles/Layout.module.css';

export default function Header() {
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
            href="https://fastapi.tiangolo.com/"
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
