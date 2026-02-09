# AdTech Insider (Vite SPA)

React + TypeScript + Vite SPA for comparing adtech companies. Configurable for any number of companies with deterministic mock data.

## File Tree

```
adtech-insider-vite/
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── public/
│   └── logos/
│       ├── taboola.png
│       ├── teads.png
│       ├── the-trade-desk.png
│       └── simpli-fi.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── company.ts          # QuarterId, CompanyId, CompanyBase, CompanyMetrics, Company
    ├── data/
    │   └── companies.ts        # companiesBase: CompanyBase[]
    ├── lib/
    │   ├── computeCompany.ts   # computeCompanyMetrics, buildCompanies
    │   ├── normalizeScores.ts  # normalizeScores (0-100, max==min -> 50)
    │   ├── normalizeScores.test.ts
    │   └── mockCompany.ts      # createMockCompany(seed)
    ├── config/
    │   └── metrics.ts          # METRIC_CONFIG (Activity blue, Intensity purple, Peak green, Perception teal)
    ├── store/
    │   └── useCompaniesStore.ts
    ├── components/
    │   ├── CompanyDashboard.tsx
    │   ├── CompanyDashboard.test.tsx
    │   ├── CompareView.tsx
    │   └── CompareView.test.tsx
    └── test/
        ├── setup.ts            # ResizeObserver mock, @testing-library/jest-dom
        └── fixtures.ts         # Deterministic test data
```

## Metric Rules

- **perceptionAvg**: average(quarters.brandPerception)
- **intensityAvg**: average(quarters.marketingIntensity)
- **activityCount**: sum(quarters.keyActivities.length)
- **peakScore**: max(quarters.keyActivities.length) per quarter
- **consistency**: clamp(100 - stdDev(brandPerception) * 2, 0, 100)
- **composite**: 40% perception + 25% intensity + 20% activityNormalized + 15% consistency
- **confidence**: 100 if all 4 quarters, finite, in-range; else reduced

## Commands

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run Vitest tests
```

## Routing

- `/` - Home (first company dashboard)
- `/company/:id` - Company dashboard
- `/compare` - Compare view (normalized + ranked charts)
