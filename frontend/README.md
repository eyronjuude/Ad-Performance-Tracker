This is the frontend for the Ad Performance Tracker, built with [Next.js](https://nextjs.org).

## Getting Started

1. Copy `frontend/.env.example` to `frontend/.env` and set `NEXT_PUBLIC_API_URL` if the backend runs elsewhere (default: `http://127.0.0.1:8000`).
2. Run the development server:

```bash
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the Ad Performance Dashboard.

## Pages

- **/** -- Ad Performance Dashboard with separate Tenured and Probationary employee sections
- **/settings** -- Configure employee name/acronym mapping, tenured/probationary status with start/review dates, Spend (AUD) and cROAS evaluation thresholds
- **/dashboard** -- Redirects to /
- **/ads** -- Ads detail page (P1 filter for tenured, date-range filter for probationary)

## Loading States

The dashboard and settings pages show skeleton loaders while settings are fetched from the API, avoiding harsh flashes of default content before the real data loads.

## Sidebar

The app includes a sidebar for navigation between Dashboard and Settings. Settings are stored in the backend (Postgres/Neon or SQLite) and shared across all users. Ensure the backend is running and `NEXT_PUBLIC_API_URL` points to it.

## Configuration

- **Employees**: Configure in Settings page or edit `lib/config.ts` (`EMPLOYEES`) for defaults.
- **Evaluation keys**: Configure in Settings page or edit `lib/config.ts` (`SPEND_EVALUATION_KEY`, `CROAS_EVALUATION_KEY`).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
