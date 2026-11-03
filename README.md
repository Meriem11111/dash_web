This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Study data

The app reads schema-v2 JSON files from `data/study-records/`. The preview includes the supplied teammate record and 4,043 labeled demo records covering all 117 map countries and all 11 programs and initiatives. Each entry supports the same program → study selection → dashboard workflow. Regenerate the regional demo batches with `node scripts/generate-demo-coverage.mjs` (Node.js 22.18+). Verify all 11 selection workflows with `npm run test:programs`. The original `data/studies.json` remains unchanged.

For the Supabase migration, replace only `fetchStudyRecords()` in `lib/studySource.ts`; it returns raw records to the shared normalizer. The pages, charts, map and selected-study dashboard keep the same data contract. See [data integration notes](data/INTEGRATION.md) for collection matching and replacing the demo files.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
