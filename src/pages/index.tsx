import { useState, useMemo, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell as BarCell,
} from "recharts";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccuracyWarning from "@/components/AccuracyWarning";
import styles from "@/styles/Home.module.css";
import {
  aggregatePredictions,
  buildAggBar,
  getColor,
  getLightColor,
  ReviewPrediction,
} from "@/lib/sentimentUtils";

const PREVIEW_LIMIT = 6;

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReviewPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Scroll into view whenever results arrive
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    const reviewsArray = text.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    if (reviewsArray.length === 0) { setLoading(false); return; }

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviewsArray }),
      });
      if (!res.ok) throw new Error("Failed to reach the analysis service.");
      const data = await res.json();
      if (data.predictions) setResults(data.predictions);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    sessionStorage.setItem("sa_results", JSON.stringify(results));
    router.push("/predictions");
  };

  const { counts, pieData, dominantSentiment } = useMemo(
    () => aggregatePredictions(results),
    [results]
  );
  const aggBar = useMemo(() => buildAggBar(results), [results]);
  const preview = results.slice(0, PREVIEW_LIMIT);
  const hasMore = results.length > PREVIEW_LIMIT;

  return (
    <div className={styles.page}>
      <Head>
        <title>SentimentIQ — Sentiment Analysis</title>
        <meta name="description" content="Batch sentiment analysis using TF-IDF and Naive Bayes." />
      </Head>

      <Header />

      {/* ── HERO: dark gradient with floating input card ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>

          {/* Left: headline */}
          <div className={styles.heroText}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroDot}></span>
              TF-IDF + Multinomial NB · Live
            </div>
            <h1 className={styles.heroTitle}>
              Understand how your<br />
              <span>text truly feels.</span>
            </h1>
            <p className={styles.heroSub}>
              Paste reviews or feedback below — one per line — and let the model classify each as Positive, Neutral, or Negative.
            </p>
          </div>

          {/* Right: floating input card */}
          <div className={styles.inputCard}>
            <AccuracyWarning />
            <p className={styles.inputCardLabel}>Reviews · one per line</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={"The product is great and reliable.\nWorst purchase I've ever made.\nIt's okay, does the job."}
              className={styles.textarea}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className={styles.button}
            >
              {loading ? (
                <><span className={styles.spinner}></span> Analyzing…</>
              ) : "Analyze"}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </div>

        </div>
      </section>

      {/* ── BODY ── */}
      <main className={styles.main}>

        {/* Model comparison (always visible) */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Model Comparison</p>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Acc.</th>
                  <th>F1</th>
                  <th>AUC</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.activeRow}>
                  <td>
                    TF-IDF + MNB
                    <span className={styles.activeBadge}>Active</span>
                  </td>
                  <td>69.6%</td>
                  <td>0.696</td>
                  <td>0.862</td>
                </tr>
                <tr>
                  <td>BoW + MNB</td>
                  <td>69.3%</td>
                  <td>0.691</td>
                  <td>0.843</td>
                </tr>
                <tr>
                  <td>BoW + BNB</td>
                  <td>65.7%</td>
                  <td>0.651</td>
                  <td>0.829</td>
                </tr>
                <tr>
                  <td>TF-IDF + BNB</td>
                  <td>65.7%</td>
                  <td>0.651</td>
                  <td>0.829</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Results (conditional) */}
        {results.length > 0 && (
          <div className={styles.resultsSection} ref={resultsRef}>

            {/* Aggregates */}
            <div className={styles.aggregatesRow}>

              {/* Donut */}
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "0.8rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutCenter}>
                  <span className={styles.donutNum}>{results.length}</span>
                  <span className={styles.donutLabel}>total</span>
                </div>
              </div>

              {/* Dominant stat */}
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Dominant</span>
                <span
                  className={styles.statValue}
                  style={{ textTransform: "capitalize" }}
                >
                  {dominantSentiment}
                </span>
                <div
                  className={styles.statAccent}
                  style={{ background: getColor(dominantSentiment) }}
                ></div>
              </div>

              {/* Aggregated bar */}
              <div className={styles.aggBarWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={aggBar}
                    margin={{ top: 4, right: 12, left: -24, bottom: 0 }}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--bg)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "0.8rem",
                      }}
                      formatter={(val: any) => [val, "Reviews"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {aggBar.map((entry, i) => (
                        <BarCell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Detailed cards */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Results
                {hasMore && (
                  <span className={styles.sectionCount}>
                    showing {PREVIEW_LIMIT} of {results.length}
                  </span>
                )}
              </h2>
              {hasMore && (
                <button onClick={handleViewAll} className={styles.viewAllLink}>
                  View all {results.length} →
                </button>
              )}
            </div>

            <div className={styles.grid}>
              {preview.map((result, idx) => (
                <div key={idx} className={styles.resultCard}>
                  <div
                    className={styles.resultCardAccent}
                    style={{ background: getColor(result.predicted_sentiment) }}
                  ></div>
                  <div className={styles.resultCardBody}>
                    <p className={styles.reviewText}>
                      "{result.original_review}"
                    </p>
                    <span
                      className={styles.badge}
                      style={{
                        background: getLightColor(result.predicted_sentiment),
                        color: getColor(result.predicted_sentiment),
                      }}
                    >
                      {result.predicted_sentiment}
                    </span>
                    <hr className={styles.confidenceDivider} />
                    {Object.entries(result.probabilities).map(([s, prob]) => (
                      <div key={s} className={styles.confidenceRow}>
                        <span className={styles.confLabel}>{s}</span>
                        <div className={styles.confTrack}>
                          <div
                            className={styles.confFill}
                            style={{
                              width: `${(prob as number) * 100}%`,
                              background: getColor(s),
                            }}
                          ></div>
                        </div>
                        <span className={styles.confValue}>
                          {((prob as number) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
