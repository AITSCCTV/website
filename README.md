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

## Responsive layouts

The shared layout stacks captured columns through 1024px to match the mobile navigation breakpoint. Text widgets and tables of contents use the available width, videos retain a 16:9 ratio, listing cards have consistent spacing, and footer/navigation targets remain easy to tap. Contact channels form a two-column grid on small screens. Questions and Careers copy uses a readable foreground on the captured dark background.

Run `node scripts/responsive-all.mjs` against a running preview (default port 3002; override with `TEST_ORIGIN`) to check all 39 routes at 320, 360, 390, 430, 768 and 1024px. It checks clipped text, page overflow, section links, menu behavior, listing spacing, video embedding and FAQ expansion. Wide comparison tables scroll inside their own container. External WordPress article bodies, forms and account pages remain outside this frontend's layout scope. Visual screenshots and results are saved in the ignored `qa` directory. No Lighthouse score is inferred from these checks.

## Images, icons and captured CSS

Static raster images have local WebP candidates at up to 160, 320, 640 and 1280 pixels. Generated pages and the article archive use `srcset` and `sizes`; phone backgrounds use smaller candidates. SVG and animated media keep their original formats. Full-size promotion links still open the original images.

After adding or changing captured images, run `npm run optimize:images`, then `npm run generate`. The optimizer downloads external originals into the ignored `qa/image-originals` cache. The versioned `src/lib/image-assets.json` and `public/assets` variants make regular builds independent of WordPress. Check `qa/image-optimization.json` for failures. Node Sharp is pinned as a development dependency.

Header and footer links use `prefetch={false}` while retaining Next.js client navigation. Kanit uses three weights (300, 400, 600); the other text weights map to these. Legacy icon fonts are replaced with small SVG masks made from their original outlines. Versioned icons need no Python during normal builds. Optional `scripts/export-svg-icons.py` requires fonttools and brotli to regenerate outlines; copyright and Font Awesome license notices are included with the assets.

The generator keeps only rendered classes, factors 46 common declarations into `public/pages/shared.css`, and groups identical remaining rules. Source captures are kept intact for future regeneration. After service restructuring, captured CSS is approximately 1.1 MB across 35 generated pages, down from 6 MB; these are uncompressed totals, not per-visit downloads.

Run `npm run test:performance` against a production preview (set `TEST_ORIGIN` when using another port). It checks responsive raster images across all 39 pages, intrinsic image dimensions, missing local resources, legacy font downloads and navigation/footer prefetching. Measured asset sizes are saved to `qa/performance-regression.json`; these local checks do not represent a public PageSpeed score.

## Service and article structure

All 22 service pages follow the same order: overview, benefits, options/pricing, relevant projects, and quotation/contact. Their original service descriptions and package information remain available; supplementary technical content uses native expandable panels. Service-specific warranty periods and qualifiers are retained. Repeated installation galleries are collected on About Us (8 initial images, 61 additional images behind an expandable panel). Service pages instead link to that gallery through a compact trust statement.

`scripts/service-policy.mjs` defines retained service sections and curated published content. Related articles are labelled separately from project stories. Where no matching published case is available, the page offers a way to ask the team for examples. The project portfolio retains its 20 entries; the article archive retains all 99 articles, including every entry from the former blog listing. Reviews and FAQs remain on the homepages only.

`/blog/` redirects permanently to `/articles/` on a Next.js server. The GitHub Pages export uses an early browser redirect with a no-JavaScript fallback because Pages cannot provide application redirect rules. Browser redirects preserve search parameters and fragments. Article bodies continue linking to their existing WordPress destinations.

Run `node scripts/restructure-regression.mjs` against a running production preview (set `TEST_ORIGIN`). It checks the 22-page structure at phone and desktop widths, retained/removed sections, original warranty wording, project links, expandable technical content, gallery completeness, archive search/pagination, and legacy redirects.

After preparing a Pages export, `node scripts/restructure-pages.mjs` starts a temporary local static server and verifies project-path links, legacy redirect search/fragment preservation, the no-JavaScript fallback, and responsive assets in Chromium.
