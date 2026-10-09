AITSCCTV — Next.js design-preserving rebuild
Prepared 4 October 2026, Bangkok

STACK
Next.js 16.3.8 App Router, React 19, TypeScript, Tailwind CSS 4.
Requires Node.js 20.19 or newer. Dependencies are pinned in package-lock.json.

RUN
npm ci
npm run dev
Open http://127.0.0.1:3000/
For production-like local testing: npm run build, then npm start.
npm run typecheck
npm run verify (requires the local server running)
npm run test:browser (requires local server and Playwright Chromium;
install once with npx playwright install chromium)
node scripts/design-changes.mjs checks the English homepage, article archive,
promotion layout, contact icon and animated client loop.

STRUCTURE
src/app: routing, metadata, sitemap, preview noindex policy, shared layout.
src/components: React navigation, footer, internal links, click-to-load videos.
src/generated: 36 typed TSX page components matching the design captures.
public/pages: page-specific scoped CSS, with captured desktop padding restored
to its original percentage units where the source was fluid.
src/app/globals.css: shared styles and Tailwind theme/utilities.
public/assets: optimized captured images and icon fonts.
scripts/generate.mjs: reproducible HTML-capture-to-TSX conversion, not a runtime HTML wrapper.
The generator reads the included design-source capture. Assets are in public/assets.
Page source uses actual JSX and React components; no iframe enclosing the site.
Tailwind is available for new components; captured CSS remains where replacing it
would alter the current design. Tailwind Preflight is intentionally excluded.

DESIGN AND CONTENT
Retains all 36 captured public routes, Thai content, images, page title/description
and canonical URLs. Fixes restore invisible article/review sections, layer
decorative backgrounds behind content, and correct phone text/card widths.
Desktop rows remain intact; phone headings, columns and article feeds reflow.
Kanit is self-hosted to avoid a third-party font dependency.
Native details elements provide FAQs. React state controls mobile navigation
and video embedding. Client logos now animate left to right in a seamless
duplicated loop. Hover, keyboard focus and the pause button stop movement;
the operating system's reduced-motion preference disables animation.
Broken table-of-contents targets are matched to actual headings. Empty links
and dead carousel controls are removed, an obsolete CCTV URL is corrected,
and oversized empty embed blocks become compact external links.
Phone, LINE, external forms and technician links remain live
links to the existing destinations. No forms are submitted by this app.

LATEST HOMEPAGE CHANGES
The standards section is removed from both homepages. /articles/ contains the
complete captured archive, with search and 12 articles per page.
Promotion posters are aligned in three columns without distortion, including
on phones. Each poster links to the full-size original image.
The contact strip uses a fixed-size SVG phone icon beside the phone number.
/en/ and its child routes provide English versions of all pages, navigation,
footer, service details, videos, careers and contact. /en/articles/ contains
the archive with 118 local translated article/project bodies linked from it
and the project portfolio. TH/EN links switch to matching pages; articles
link back to their original Thai WordPress versions. Poster artwork and
original video audio remain unchanged. No runtime translation API is needed.
English FAQ wording avoids presenting captured old prices as current quotes.

VERIFICATION
Production build and TypeScript checks passed.
qa/http-audit.json records all 36 routes, headings, metadata and local assets.
qa/regression.json records headless Chromium checks on all 36 pages at four
viewport widths, including hidden content, overflow, anchors and interactions.
qa/*-fixed-*.png show desktop/phone sections in the updated local app.
qa/design-changes.json records the latest feature and layout checks at four
widths; qa/promotions-*.png and qa/contact-phone-fixed.png are visual evidence.
Live Brave comparison stopped because Computer Use could not verify its URL.
Visual checks use the saved design capture and own local preview. Exact 1:1
equivalence against the current live site remains unverified. External video
playback and external form submission are not tested. Lighthouse scores have
not been measured; no performance score improvement is claimed.

WORDPRESS / DEPLOYMENT
This is a local preview, not a replacement deployed to production.
WordPress's public posts endpoint returned HTTP 403 when checked.
Article cards currently use captured content; post links open the existing site.
Live CMS refresh is not connected. WordPress API access must be resolved before
implementing and validating live content updates. Authentication, technician
pages and existing forms remain on WordPress pending their separate migration.
The app intentionally serves noindex metadata and disallows crawling during
preview. Review that policy and every old article/account URL before production
cutover. No production changes or plugin deactivation were made.

REFERENCES
https://nextjs.org/docs/app/getting-started/installation
https://tailwindcss.com/docs/installation/framework-guides/nextjs
