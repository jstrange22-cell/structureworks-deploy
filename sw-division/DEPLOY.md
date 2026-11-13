# SW Roofing division update: deploy runbook

Branch `sw-roofing-division`. Run on the machine that holds the Hostinger SFTP credentials
(`SW_SFTP_HOST`, `SW_SFTP_PORT`, `SW_SFTP_USER`, `SW_SFTP_PASS`, `SW_SFTP_REMOTE_ROOT`).

This repo's HTML is older than the live site (last site commit May 21, live files are from Aug).
So the patch is applied to a fresh copy of the LIVE files, never to the repo's HTML.

## What it changes

- Every page: "Roofing" added to the main nav after Services; `site.css?v=` bumped.
- `site.css`: one block appended so the 8-link header fits (tighter 769-1400px, menu button 769-1080px).
- `roofing.html`: title and description under limits, schema names SW Roofing as a StructureWorks
  division (`parentOrganization`), Owens Corning Preferred badge in the trust strip, GAF logo removed,
  "Roofing Near You" city links, motion layer.
- `exteriors.html`: title and description under limits, motion layer.
- New: `roofing-knoxville.html`, `-farragut`, `-maryville`, `-oak-ridge`, `-lenoir-city`, `-sevierville`.
- `sitemap.xml`: 6 city URLs added, roofing and exteriors lastmod updated.
- New assets: `css/sw-division.css`, `js/sw-division.js`, `js/vendor/{gsap,ScrollTrigger,lenis}.min.js`.
- Tracking: `click_call` on every phone link and `estimate_click` on QuickRoofBids links (GA4 + dataLayer).
  The QuickRoofBids buttons themselves are unchanged.

Nothing is deleted on the server. `.htaccess`, images, forms, `site.js` and `analytics.js` are untouched.

## Steps

1. Back up and snapshot live: download the whole docroot over SFTP to `live-2026-11-12/`
   (skip `img/` and `fonts/` if bandwidth matters; they are not changed). Keep that folder as the rollback copy.
2. Commit the snapshot's text files to a new branch `live-snapshot-2026-11-12` in this repo, so the
   live source is finally in GitHub.
3. Apply: `node sw-division/apply.mjs live-2026-11-12 out/`. It stops and writes nothing if any
   anchor moved. Expect 27 nav lines, roofing, exteriors, 6 new city pages, sitemap and site.css.
4. Upload everything in `out/` to the docroot (same relative paths), new files first, `site.css` and
   HTML last.
5. Check from the public internet: each changed file's sha256 matches `out/`; `/roofing-knoxville`
   and the other 5 city URLs return 200 (the server already serves extensionless `.html`, as `/financing` does);
   `/roofing` shows Roofing in the nav; no console errors.
6. Post-deploy checks: submit one test inspection request on `/roofing-knoxville` and confirm it lands in
   ProjectWorks Leads; confirm `generate_lead` and `click_call` in GA4 Realtime; run Lighthouse mobile
   on `/roofing`; submit `sitemap.xml` in Search Console.

Rollback: re-upload the files listed in `out/` from `live-2026-11-12/` and delete the 6 city pages and
the 5 new assets.

## Preview without deploying

In Chrome on `https://structureworkstn.com/robots.txt`, run `sw-division/preview.js` from this branch
(see its header). It patches the live pages in the browser and renders the result.
