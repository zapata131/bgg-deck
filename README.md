# La Matatena - BGG Card Deck Generator

AI-assisted coding project to generate printable TCG-style cards from your
[BoardGameGeek](https://boardgamegeek.com/) collection.

Front: cover art + stats.
Back: La Matatena logo.
Output: print-ready PDF (A4/Letter, 300 DPI).

## ✨ Features

- Fetch BGG collection by username
- Build card fronts/backs with consistent layout
- Cache covers + short descriptions (90 days)
- Export print-ready PDFs with crop marks + bleed
- Vibe coding strategy: AI-assisted, human-directed

## 🛠️ Stack

- Next.js + React + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state
- BGG XML API2 + HTML scrape for short description
- Puppeteer for PDF export (v1)
- Planned: SVG/pdf-lib pipeline (v2)
- Deployment: Vercel / Cloudflare

## 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/bgg-card-deck.git
cd bgg-card-deck
pnpm install
pnpm dev
```

Open http://localhost:3000 to see the app.

## 📄 PDF Export

1. Select games and navigate to /print
2. Export to PDF (A4/Letter, crop marks, bleed)

## 📚 Project context

This repo uses AI-assisted coding (“vibe coding”).
Read DESIGN.md for the philosophy, stack, and design decisions.
When contributing or prompting an AI, always reference DESIGN.md to keep consistency.

## 🗺️ Roadmap

[ ] Collection fetch
[ ] Caching
[ ] Card components
[ ] Sheet preview
[ ] PDF export
[ ] i18n
[ ] SVG/pdf-lib pipeline

## 🤝 Contributing
PRs welcome! Open issues for bugs/ideas.

## 📄 License
MIT © Jose Luis Zapata