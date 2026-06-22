# Sentiment Analysis — Frontend UI

> **Part of a three-repository system.**  
> See also: [Model Training](https://github.com/peterkahumu/Sentiment-analysis-model-training) · [Backend API](https://github.com/peterkahumu/sentiment-analysis-backend)

---

## Overview

This repository contains the **Next.js frontend** for the SentimentIQ application. It provides a web interface where users can paste product reviews (one per line) and receive real-time sentiment predictions from the backend API.

Predictions are visualised using:
- Per-review sentiment badge + confidence probability bars
- Donut chart (aggregate distribution)
- Bar chart (count per sentiment class)
- Full paginated table with sentiment filter (on the `/predictions` page)

---

## Repository Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── index.tsx           # Home page — input form + results dashboard
│   │   ├── predictions.tsx     # Full predictions table (filterable)
│   │   ├── _app.tsx            # Global app wrapper
│   │   ├── _document.tsx       # Custom HTML document
│   │   └── api/
│   │       └── hello.ts        # Example Next.js API route (unused in production)
│   ├── components/
│   │   ├── Header.tsx          # Site header / nav
│   │   ├── Footer.tsx          # Site footer
│   │   └── AccuracyWarning.tsx # Inline disclaimer banner
│   ├── lib/
│   │   └── sentimentUtils.ts   # Shared types, colour mapping, aggregation helpers
│   └── styles/
│       ├── Home.module.css     # Styles for the home page
│       └── Predictions.module.css  # Styles for the predictions page
├── public/                     # Static assets
├── next.config.ts              # Next.js config + API proxy rewrites
├── package.json
├── Dockerfile
└── README.md
```

---

## How It Works

### API Communication

The frontend does **not** call the backend directly from the browser. Instead, Next.js's [URL rewrites](https://nextjs.org/docs/pages/api-reference/config/next-config-js/rewrites) proxy all `/api/*` requests to the backend service:

```
Browser  →  POST /api/predict  →  Next.js rewrite  →  http://backend:8000/predict
```

This keeps the backend URL hidden from the client and avoids CORS issues. The proxy target is configured via the `BACKEND_URL` environment variable (defaults to `http://localhost:8000`).

### User Flow

1. User pastes reviews into the textarea (one per line)
2. Clicking **Analyze** sends a `POST /api/predict` request
3. The response is rendered as:
   - Individual result cards (up to 6 preview cards on the home page)
   - Donut + bar chart aggregates
4. Clicking **View all →** stores results in `sessionStorage` and navigates to `/predictions`
5. The predictions page displays all results in a filterable table

---

## Pages

### `/` — Dashboard

| Element | Description |
|---|---|
| Textarea | Multi-line review input (one review per line) |
| Analyze button | Submits reviews to the backend |
| Donut chart | Sentiment distribution across all submitted reviews |
| Bar chart | Review count per sentiment class |
| Result cards | Per-review sentiment label + confidence bars (first 6) |
| Model comparison table | Accuracy metrics for all 4 trained models |

### `/predictions` — Full Results Table

| Element | Description |
|---|---|
| Filter bar | Toggle between All / Positive / Neutral / Negative |
| Results table | Review text, predicted sentiment badge, per-class probability mini-bars |
| Back link | Returns to the dashboard |

---

## Running Locally

### Prerequisites

- Node.js 22+
- The [backend API](https://github.com/peterkahumu/sentiment-analysis-backend) running on `http://localhost:8000`

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server proxies `/api/*` to `http://localhost:8000` automatically (see `next.config.ts`).

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

Set this when running in Docker or production:

```bash
BACKEND_URL=http://backend:8000 npm run build && npm run start
```

---

## Building for Production

```bash
npm run build
npm run start
```

The production build uses Next.js **standalone output** (`output: "standalone"` in `next.config.ts`), which produces a minimal Node.js server bundle suitable for Docker.

---

## Docker

### Build and run this service alone

```bash
docker build -t sentiment-frontend .
docker run -p 3000:3000 -e BACKEND_URL=http://localhost:8000 sentiment-frontend
```

### Run the full stack with Docker Compose

See the [root `docker-compose.yml`](../docker-compose.yml):

```bash
# From the nlp/ project root
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend | [http://localhost:8001](http://localhost:8001) |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.9 | React framework + routing + API rewrites |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Recharts | ^3.8.1 | Donut chart + bar chart visualisations |
| Tailwind CSS | ^4 | Utility-first styling |

---

## Connecting to the Rest of the System

```
model_training  ──(model_artifacts)──▶  backend  ──(REST API /api/*)──▶  frontend
     │                                      │                                  │
  Training repo                        Backend repo                        This repo
```

| Repository | Purpose | Link |
|---|---|---|
| **model_training** | Train & evaluate the model | [github.com/peterkahumu/Sentiment-analysis-model-training](https://github.com/peterkahumu/Sentiment-analysis-model-training) |
| **backend** | Serve predictions via FastAPI | [github.com/peterkahumu/sentiment-analysis-backend](https://github.com/peterkahumu/sentiment-analysis-backend) |
| **frontend** (this) | User-facing Next.js UI | — |
