# AdTech Insider

Boardroom-ready Marketing Intelligence Dashboard for AdTech companies (Taboola, Teads, The Trade Desk, Simpli.fi).

## Setup

```bash
# Create project (if starting fresh)
npx create-next-app@latest adtech-insider --ts --tailwind --eslint --app

# Install dependencies
npm i framer-motion recharts lucide-react clsx tailwind-merge zustand next-themes

# shadcn components
npx shadcn@latest init
npx shadcn@latest add card badge button sheet separator skeleton tooltip
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/company/taboola` by default.

## Structure

- `app/` – Next.js App Router (layout, pages, company/[slug])
- `components/` – layout (sidebar, app-shell, route-transition), dashboard (hero, timeline, bubble-chart, kpi-strip), ui (shadcn)
- `data/` – mock 2025 quarterly data
- `lib/` – cn helper, theme provider
- `store/` – Zustand company store
- `types/` – strict TypeScript types 
