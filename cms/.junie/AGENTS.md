# Project Guidelines & Overview

## Project Overview
This repository is a Content Management System (CMS) web application built using **Next.js** (App Router) integrated with **Sanity Studio v5** (Headless CMS) and **Tailwind CSS**.

### Key Tech Stack
- **Framework:** Next.js (App Router, Turbopack)
- **CMS:** Sanity Studio (`sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision`)
- **Frontend / Styling:** React 19, Tailwind CSS v4, Styled Components
- **Language / Typing:** TypeScript, ESLint 9

---

## Project Structure
```text
cms/
├── app/                        # Next.js App Router directory
│   ├── blog/                   # Blog listing route consuming Sanity content
│   ├── studio/[[...tool]]/     # Embedded Sanity Studio route (/studio)
│   ├── layout.tsx              # Root layout & font configuration
│   ├── page.tsx                # Home landing page
│   └── globals.css             # Global styles / Tailwind setup
├── sanity/                     # Sanity configuration and schemas
│   ├── lib/                    # Sanity client, image builder, live helpers
│   │   ├── client.ts           # Sanity client instance
│   │   ├── image.ts            # Sanity image URL builder helper
│   │   └── live.ts             # Sanity live content streaming
│   ├── schemaTypes/            # Sanity document and object schemas
│   │   ├── index.ts            # Schema aggregation
│   │   └── postType.ts         # Post schema definition
│   ├── env.ts                  # Sanity environment variable validations
│   └── structure.ts            # Sanity Studio structure resolver configuration
├── public/                     # Static assets
├── sanity.cli.ts               # Sanity CLI configuration
├── sanity.config.ts            # Sanity Studio workspace configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies and run scripts
```

---

## Environment Variables
The application relies on the following environment variables (stored in `.env.local` for local development):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`: The Sanity Project ID
- `NEXT_PUBLIC_SANITY_DATASET`: The Sanity Dataset name (e.g. `production`)
- `NEXT_PUBLIC_SANITY_API_VERSION`: API version date (optional, defaults to current/configured version)
- `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and `SANITY_STUDIO_API_VERSION`: matching values used by the standalone Sanity Studio; keep them aligned with the `NEXT_PUBLIC_SANITY_*` variables.

---

## Available Scripts & Commands
- **Development Server:**
  ```bash
  npm run dev
  ```
  Starts Next.js dev server on `http://localhost:3000`. Sanity Studio is accessible at `http://localhost:3000/studio`.

- **Production Build:**
  ```bash
  npm run build
  ```
  Creates an optimized production build.

- **Start Production Server:**
  ```bash
  npm run start
  ```

- **Linting:**
  ```bash
  npm run lint
  ```
  Runs ESLint across the codebase.

---

## Development Guidelines for AI Agents
1. **App Router Conventions:** Follow standard Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`, Server vs. Client Components).
2. **Sanity Integration:**
   - Define new schemas inside `sanity/schemaTypes/` and export them in `sanity/schemaTypes/index.ts`.
   - Use `client` from `@/sanity/lib/client` or `sanityFetch` from `@/sanity/lib/live` for fetching CMS data.
   - Use `urlFor` from `@/sanity/lib/image` for building image asset URLs.
3. **Styling & Components:**
   - Use Tailwind CSS utility classes adhering to project standards.
4. **Verification:**
   - Run `npm run lint` or `npm run build` when making significant structural or code changes to ensure type-safety and build integrity.
