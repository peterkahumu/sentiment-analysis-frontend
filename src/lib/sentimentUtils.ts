// Shared types and utilities for sentiment analysis

export type SentimentClass = 'positive' | 'negative' | 'neutral';

export interface ReviewPrediction {
  original_review: string;
  cleaned_review: string;
  predicted_sentiment: string;
  probabilities: Record<string, number>;
}

export const SENTIMENT_COLORS: Record<SentimentClass, string> = {
  positive: '#059669',  // emerald
  neutral: '#2563eb',   // blue
  negative: '#4f46e5',  // indigo
};

export const SENTIMENT_LIGHT: Record<SentimentClass, string> = {
  positive: '#ecfdf5',
  neutral: '#eff6ff',
  negative: '#eef2ff',
};

export const SENTIMENT_TEXT: Record<SentimentClass, string> = {
  positive: '#059669',
  neutral: '#2563eb',
  negative: '#4f46e5',
};

export function getColor(sentiment: string): string {
  return SENTIMENT_COLORS[sentiment.toLowerCase() as SentimentClass] ?? '#94a3b8';
}

export function getLightColor(sentiment: string): string {
  return SENTIMENT_LIGHT[sentiment.toLowerCase() as SentimentClass] ?? '#f1f5f9';
}

export function getTextColor(sentiment: string): string {
  return SENTIMENT_TEXT[sentiment.toLowerCase() as SentimentClass] ?? '#64748b';
}

export function aggregatePredictions(predictions: ReviewPrediction[]) {
  const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
  predictions.forEach(p => {
    const s = p.predicted_sentiment.toLowerCase();
    if (s in counts) counts[s]++;
  });

  const pieData = [
    { name: 'Positive', value: counts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: counts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: counts.negative, color: SENTIMENT_COLORS.negative },
  ].filter(d => d.value > 0);

  let dominant = 'none';
  let max = 0;
  Object.entries(counts).forEach(([s, v]) => {
    if (v > max) { max = v; dominant = s; }
  });

  return { counts, pieData, dominantSentiment: dominant };
}

// Aggregated bar chart data — one bar per sentiment class
export function buildAggBar(predictions: ReviewPrediction[]) {
  const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
  predictions.forEach(p => {
    const s = p.predicted_sentiment.toLowerCase();
    if (s in counts) counts[s]++;
  });
  return [
    { name: 'Positive', count: counts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral',  count: counts.neutral,  color: SENTIMENT_COLORS.neutral  },
    { name: 'Negative', count: counts.negative, color: SENTIMENT_COLORS.negative },
  ];
}
