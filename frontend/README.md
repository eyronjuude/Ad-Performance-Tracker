This is the frontend for the Ad Performance Tracker, built with [Next.js](https://nextjs.org).

## Getting Started

1. Copy `frontend/.env.example` to `frontend/.env` and set `NEXT_PUBLIC_API_URL` if the backend runs elsewhere (default: `http://127.0.0.1:8000`).
2. Run the development server:

```bash
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the P1 Ad Performance Dashboard.

## Pages

- **/** — P1 Ad Performance Dashboard (also linked as “Dashboard” in sidebar)
- **/settings** — Configure employee name ↔ acronym mapping, Spend (AUD) and cROAS evaluation thresholds, and other options
- **/dashboard** — Redirects to /
- **/ads** — Ads detail page (placeholder; full implementation pending)

## Sidebar

The app includes a sidebar for navigation between Dashboard and Settings. Settings are stored in the backend (SQLite) and shared across all users. Ensure the backend is running and `NEXT_PUBLIC_API_URL` points to it.

## Configuration

- **Employees**: Edit `lib/config.ts` (`EMPLOYEES`) to add or change employees.
- **Evaluation keys**: Edit `lib/config.ts` (`SPEND_EVALUATION_KEY`, `CROAS_EVALUATION_KEY`) to adjust spend and CROAS thresholds and colors.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
