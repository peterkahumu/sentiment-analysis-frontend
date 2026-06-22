import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/Predictions.module.css";
import { getColor, getLightColor, ReviewPrediction } from "@/lib/sentimentUtils";

type FilterType = 'all' | 'positive' | 'neutral' | 'negative';

export default function PredictionsPage() {
  const [results, setResults] = useState<ReviewPrediction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const raw = sessionStorage.getItem("sa_results");
    if (raw) {
      try {
        setResults(JSON.parse(raw));
      } catch {
        setResults([]);
      }
    }
  }, []);

  const filtered = filter === 'all'
    ? results
    : results.filter(r => r.predicted_sentiment.toLowerCase() === filter);

  const countFor = (s: FilterType) =>
    s === 'all' ? results.length : results.filter(r => r.predicted_sentiment.toLowerCase() === s).length;

  return (
    <div className={styles.page}>
      <Head>
        <title>All Predictions — SentimentIQ</title>
        <meta name="description" content="Full prediction results for all submitted reviews." />
      </Head>

      <Header />

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>← Back to Dashboard</Link>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>All Predictions</h1>
          <p className={styles.pageSub}>
            {results.length} review{results.length !== 1 ? 's' : ''} analyzed ·&nbsp;
            {countFor('positive')} positive · {countFor('neutral')} neutral · {countFor('negative')} negative
          </p>
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          {(['all', 'positive', 'neutral', 'negative'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({countFor(f)})
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            No results found. Go back to the dashboard and analyze some reviews first.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Review</th>
                  <th>Predicted</th>
                  <th>Positive</th>
                  <th>Neutral</th>
                  <th>Negative</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((result, idx) => {
                  const probs = result.probabilities;
                  return (
                    <tr key={idx}>
                      <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {(results.indexOf(result) + 1).toString().padStart(2, '0')}
                      </td>
                      <td className={styles.reviewCell}>
                        <span className={styles.reviewCellText} title={result.original_review}>
                          {result.original_review}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{ background: getLightColor(result.predicted_sentiment), color: getColor(result.predicted_sentiment) }}
                        >
                          {result.predicted_sentiment}
                        </span>
                      </td>
                      {['positive', 'neutral', 'negative'].map(s => (
                        <td key={s}>
                          <div className={styles.miniBar}>
                            <div className={styles.miniTrack}>
                              <div
                                className={styles.miniFill}
                                style={{ width: `${((probs[s] ?? 0) * 100).toFixed(0)}%`, background: getColor(s) }}
                              ></div>
                            </div>
                            <span className={styles.miniValue}>{((probs[s] ?? 0) * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
