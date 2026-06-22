import styles from '../styles/Layout.module.css';

export default function AccuracyWarning() {
  return (
    <div className={styles.warning}>
      <span className={styles.warningIcon}>⚠</span>
      <span>
        <strong>Accuracy Notice:</strong> This model achieves ~70% accuracy on benchmark data. Results may vary depending on the nature of the text. Use for exploratory purposes only.
      </span>
    </div>
  );
}
