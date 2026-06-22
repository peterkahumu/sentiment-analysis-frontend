import styles from '../styles/Layout.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.footerText}>
          SentimentIQ — Powered by <strong>TF-IDF + Multinomial Naive Bayes</strong> &nbsp;·&nbsp; Model Accuracy: <strong>69.6%</strong>
        </p>
        <p className={styles.footerSub}>
          This tool is intended for research and exploratory purposes. Results should not be used for high-stakes decisions.
        </p>
      </div>
    </footer>
  );
}
