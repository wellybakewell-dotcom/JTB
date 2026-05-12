# JTB — Engineered Web. Built to Scale.

High-conversion landing page for the JTB Studios LinkedIn campaign. Standalone, no build step, drops on any host.

```
jtb-engine-landing/
├── index.html               ← single page, all 8 sections
├── styles.css               ← hand-written, design tokens at top
├── script.js                ← reveals, count-up, smooth scroll, form
├── assets/
│   ├── favicon.svg          ← JTB mark, swap if you have a brand asset
│   └── showreel-poster.svg  ← placeholder until you supply a real poster
├── public/
│   └── showreel.mp4         ← DROP YOUR VIDEO HERE (not yet present)
└── README.md
```

---

## Quick start

Open `index.html` directly in a browser, or serve locally:

```bash
npx serve -p 4321 .
# or
python -m http.server 4321
```

Then visit `http://localhost:4321`.

---

## Deploy

The page is fully static — `index.html` + `styles.css` + `script.js` + `/assets` + `/public`. Drop on any host.

**Recommended: Vercel** (free tier, instant SSL, edge CDN)

```bash
npx vercel --prod
```

Then in Vercel project settings → Domains, add `engine.jtbstudios.com.au` (or `go.jtbstudios.com.au`). Your dev team adds **one CNAME record** at the JTB DNS host pointing to `cname.vercel-dns.com`. Total: ~5 minutes.

**Alternatives**: Netlify Drop (drag the folder into [app.netlify.com/drop](https://app.netlify.com/drop)), Cloudflare Pages, S3 + CloudFront, or upload via SFTP into a subdirectory of your existing WordPress host (e.g. `/engine/`).

---

## Content checklist (before going live)

These show up as visible amber TODO chips in the page so they don't get missed:

- [ ] **Showreel video** — drop a 60-second `.mp4` at `/public/showreel.mp4`. Optional: real poster image at `/assets/showreel-poster.jpg` (then update the `poster=` attribute in `index.html` from `.svg` to `.jpg`)
- [ ] **Client logos** — replace the text wordmarks (`Coopers`, `AGL`, `Driscoll's`, `St Kilda FBC`) with SVG files. Drop SVGs into `/assets/logos/` and replace `<span class="logo-wordmark">…</span>` with `<img src="assets/logos/coopers.svg" alt="Coopers" class="client-logo" />`. Add corresponding CSS (height ~28px, opacity 0.7 → 1 on hover) to `.client-logo`
- [ ] **Stat numbers** — replace `[XX]` with real values in three places in `index.html`. The `data-count="0"` attribute on each `.stat__number` controls the count-up animation: set it to the final integer to enable the animation (e.g. `data-count="312"` for `312%`)
- [ ] **Stat client/industry** — replace each `<span>Client</span><span>Industry</span>` pair with the real attribution
- [ ] **Case studies link** — the `<a class="link-arrow" href="#">` in section 03 currently points to `#`. Update `href` when the case studies page is live
- [ ] **Form endpoint** — see below

---

## Wiring the contact form

Currently the form prevents default submission, validates locally, logs the payload to `console`, and shows a fake success state. Pick one:

### Option A — Formspree (easiest, no code)
1. Create a free form at [formspree.io](https://formspree.io) → get your endpoint URL (e.g. `https://formspree.io/f/abc123`)
2. In `index.html`, change `<form id="contact-form" novalidate>` to `<form id="contact-form" novalidate action="https://formspree.io/f/abc123" method="POST">`
3. In `script.js`, replace the `console.log(…)` block with a real `fetch` call. Or just remove the `e.preventDefault()` and let the browser submit natively.

### Option B — HubSpot / Marketo / your CRM
Forms have an embed snippet. Either replace this form entirely with their HTML, or POST to their forms API in `script.js` (look for the `// TODO: wire to real endpoint` comment).

### Option C — Resend + a function
If you're already on Vercel, drop in `/api/contact.js`:
```js
// pseudo
import { Resend } from 'resend';
export default async function handler(req, res) {
  const { name, company, email, ...rest } = JSON.parse(req.body);
  await new Resend(process.env.RESEND_KEY).emails.send({
    from: 'no-reply@jtbstudios.com.au',
    to: 'hello@jtbstudios.com.au',
    subject: `New build enquiry — ${company}`,
    text: JSON.stringify({ name, email, ...rest }, null, 2),
  });
  res.status(200).json({ ok: true });
}
```
Then in `script.js`, swap the `console.log` for `await fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload) });`.

---

## Tracking (LinkedIn ads)

Drop your LinkedIn Insight Tag inside `<head>` in `index.html`. For conversion tracking, fire a `lintrk('track', { conversion_id: ... })` call inside the form's submit handler in `script.js` after a successful response.

GA4: same idea — paste the gtag snippet in `<head>`, then `gtag('event', 'generate_lead', {...})` on submit.

---

## Design system (in `styles.css`)

All tokens live at the top of `styles.css` under `:root`. Change once, applies everywhere:

```css
--accent:    #FF5B1F;   /* ignition orange — change to brand orange when known */
--bg:        #0B0B0C;   /* deep charcoal */
--fg:        #F2F0EB;   /* warm off-white */
--font-sans: 'Inter';   /* swap for Söhne/Geist/etc when you have a license */
```

The page reads as a single coherent design system — moving these values cascades everywhere.

---

## Browser support

Tested mental model: latest Chrome, Edge, Firefox, Safari. Uses:
- IntersectionObserver (everything 2018+)
- CSS Grid, custom properties, `aspect-ratio`, `clamp()`
- `backdrop-filter` (Safari 9+, Chrome 76+, Firefox 103+)
- Reduced-motion respected throughout

No polyfills needed. No bundler needed. No dependencies.

---

## What's not in this build (intentional)

- Cookie banner / consent — add when you wire analytics
- Sitemap.xml / robots.txt — campaign landers usually want `noindex,nofollow` (LinkedIn paid traffic, no SEO value). Add `<meta name="robots" content="noindex,nofollow" />` to `<head>` if you don't want this page indexed
- Multi-page routing — this is a single-page lander by design

---

## Branding alignment

This page is **stylistically distinct** from the main jtbstudios.com.au site (dark editorial vs. light corporate) — that's deliberate for a campaign-specific lander. If/when the founder wants closer alignment with the main site, swap the tokens above and adjust the hero treatment. The structure and copy stay the same.
