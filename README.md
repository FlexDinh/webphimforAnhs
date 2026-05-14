This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

`npm run dev` uses webpack with dev source maps disabled and a capped Node heap
to keep local development stable on lower-memory machines. Use
`npm run dev:turbo` only when you explicitly want Turbopack.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production Security

Before deploying to Vercel, add these Environment Variables in Project Settings:

```bash
CEO_AUTH_USERNAME=your-admin-name
CEO_AUTH_PASSWORD=use-a-long-random-password
NEXT_PUBLIC_SHOW_CEO_LINK=false
```

`/ceo` is protected by Basic Auth in production and preview deployments. If
`CEO_AUTH_USERNAME` or `CEO_AUTH_PASSWORD` is missing in production, the CEO
page returns `503` instead of opening publicly.

Optional public API settings are documented in `.env.example`. After changing
any Vercel Environment Variable, redeploy so the new value is applied.

Production check before shipping:

```bash
npm run lint
npm test
npm run build
```

After deployment, verify `/api/health` returns `{"status":"ok"}` and `/ceo`
asks for the CEO username and password.
"# rophim" 
