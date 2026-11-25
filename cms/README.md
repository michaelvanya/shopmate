# ShopMate storefront

The storefront uses Next.js for the web app and its Stripe checkout/webhook handlers. Customer accounts and the separate Node auth API are not required; shoppers can check out as guests. Sanity hosts the product catalog and the editor workspace.

## Configure

Copy `.env.example` to `.env.local` and set the Sanity project ID and dataset. Add Stripe keys to enable checkout and a server-only `SANITY_API_TOKEN` for order writes. Set `NEXT_PUBLIC_SANITY_STUDIO_URL` if the Studio is deployed somewhere other than `http://localhost:3333/studio`.

## Run locally

Start the storefront and the Sanity Studio in separate terminals from this directory:

```bash
npm run dev
npm run studio:dev
```

The storefront runs on [http://localhost:3000](http://localhost:3000); the Studio runs on [http://localhost:3333/studio](http://localhost:3333/studio). Sign in to Sanity CLI first if the Studio prompts you to authenticate.

## Deploy to Vercel

Import the `michaelvanya/shopmate` GitHub repository as one Vercel project and set its **Root Directory** to `cms`. The Next.js app includes the Sanity Studio at `/studio`; Sanity continues to host the Content Lake and dataset, so no separate Sanity data service needs deployment.

Set these Vercel environment variables for the environments you use:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_SANITY_STUDIO_URL` to `https://<your-domain>/studio`
- `SANITY_API_TOKEN` with write access for order capture
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL` to `https://<your-domain>`

Add the deployed site origin to the Sanity project's CORS origins, allowing credentials for Studio sign-in. In Stripe, point the webhook to `https://<your-domain>/api/webhook` and subscribe to `checkout.session.completed`.

## Sample catalog

Preview the sample-data plan without writing anything:

```bash
npm run seed:demo
```

To add or refresh the six sample categories, eight sample products, and their images in the configured Sanity dataset, sign in with the Sanity CLI and run:

```bash
npm run seed:demo:write
```

The seed is repeatable and only upserts the sample documents identified by their `demo-` slugs; it does not delete or replace unrelated content.
