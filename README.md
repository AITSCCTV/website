# AITSCCTV frontend

GitHub Pages preview: https://aitscctv.github.io/website/

The Pages workflow builds and deploys every push to `main`. In repository Settings → Pages, select **GitHub Actions** as the source. Pages must be available for the repository's visibility and account plan.

For a Pages build, set `GITHUB_PAGES=true`, run `npm run build`, then `node scripts/prepare-pages.mjs`. Deploy the `out` directory. The export uses `/website` as its base path; the preparation step prefixes captured public asset URLs in HTML, client bundles, RSC payloads and CSS. Normal local development and server builds still run at `/`. Preview search indexing remains disabled.

Next.js, React, TypeScript and Tailwind frontend with Thai and English homepages.

## Run locally

Requires Node.js 20.19 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000/. For a production build, run `npm run build` then `npm start`.

## Checks

```sh
npm run typecheck
npm run build
```

With the local server running, `npm run verify` checks routes and assets. Install test Chromium with `npx playwright install chromium`, then run `node scripts/design-changes.mjs`.

## Source

- `src/app`: routes and shared layout
- `src/components`: navigation, archive, client animation, video and contact controls
- `src/generated`: typed design-preserving pages
- `public`: local images, fonts and page styles
- `design-source`: inputs for `npm run generate`

Homepage standards cards are removed. The complete article archive remains at `/articles/`; English homepage and archive interface are at `/en/` and `/en/articles/`. Original articles and service details remain Thai.

This is a preview build: search indexing is disabled and live CMS updates are not connected. External forms, technician login and original article bodies link to existing destinations. See README.txt for details.
