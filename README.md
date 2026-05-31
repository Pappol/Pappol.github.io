# Pappol — personal blog

A minimal, fast, light/dark personal blog for **Riccardo "Pappol" Parola**, built with
[Astro](https://astro.build) and deployed free on **GitHub Pages** at `https://pappol.github.io`.

Public to read, only you can edit (you own the repo). Articles are plain Markdown.

---

## Pages

- **Home** (`/`) — photo, short bio, social links, 3 most-recent posts, GDPR email signup.
- **Blog** (`/blog`) — every article, newest first.
- **About** (`/about`).
- **Easter Eggs** (`/easter-eggs`) — hidden; documents every egg (see below).
- **Privacy** (`/privacy`) — GDPR-compliant policy for the newsletter.
- Plus a custom **404**, an **RSS feed** (`/rss.xml`) and a **sitemap**.

## The "Pappol" easter eggs

1. **Signature colour** — `Pappol` → ASCII `80+97+112+112+111+108 = 620`, `620 mod 360 = 260°` → indigo. The whole palette is built on `--pappol-hue: 260`. Change that one number to re-skin everything.
2. **Motion** — same sum drives the easing `cubic-bezier(0.62, 0, 0.38, 1)` and a `260ms` base duration.
3. **Type `pappol`** anywhere → confetti + a full hue-spin ("Pappol mode").
4. **Console greeting** in DevTools on every page.
5. **Hidden door** — the page isn't in the menu; the full-stop after your name in the footer links to it.

---

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to ./dist
npm run preview  # preview the production build
```

> Requires Node 18+ (Node 20/22 recommended).

---

## Deploy to GitHub Pages (one-time setup)

1. **Create the repo** on your account, named **exactly** `Pappol.github.io`
   (a user site → served at the domain root).
2. Push this folder to the **`main`** branch:
   ```bash
   git init
   git add .
   git commit -m "Initial blog"
   git branch -M main
   git remote add origin https://github.com/Pappol/Pappol.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every
   push to `main`. First deploy takes ~1–2 min, then the site is live at
   `https://pappol.github.io`.

---

## Write a new post

Create a Markdown file in `src/content/blog/`, e.g. `my-post.md`:

```markdown
---
title: "My post title"
description: "One-line summary used on cards and meta tags."
pubDate: 2026-06-01
tags: ["ai", "data"]
# draft: true   # uncomment to hide from the site
---

Your content here…
```

The URL becomes `/blog/my-post/`. The home page automatically shows the 3 newest.

---

## Things to fill in (search for `TODO`)

- **Your photo** — drop it in `public/images/` and update the `src` in `src/pages/index.astro` (look for `profile-placeholder.svg`). Update the About page too.
- **Home bio** — `src/pages/index.astro` (`hero-bio`).
- **About** — `src/pages/about.md` (photo + hobbies placeholders).
- **Privacy policy** — `src/pages/privacy.md` (set the "Last updated" date; swap the Gmail for a dedicated address if you like).

---

## Connect the email newsletter (GDPR)

The signup form is built **GDPR-first**: an explicit, non-pre-ticked consent checkbox,
a link to the privacy policy, and copy that promises **double opt-in**. Out of the box
it runs in **demo mode** (shows a confirmation, sends nothing).

To go live, use an **EU-based, GDPR-friendly provider** — **MailerLite** is recommended
(EU company, free tier, easy double opt-in):

1. In MailerLite, create a subscribe form with **double opt-in ON**.
2. Copy its POST endpoint into the `ACTION` constant at the top of
   `src/components/EmailSignup.astro`.
3. Make sure the **"Last updated"** date and provider name in `src/pages/privacy.md`
   match reality.

### A note on AWeber (the policy page you saw)

`aweber.com/permission.htm` is **AWeber's own anti-spam permission reminder** — it is
**not** a privacy policy you can adopt as your own, and linking to it does **not** make
you GDPR-compliant. As an EU resident you must publish **your own** privacy notice (the
one in `src/pages/privacy.md`) and obtain explicit consent. AWeber is also **US-based**,
so using it adds an international-data-transfer obligation (Standard Contractual Clauses).
That's why MailerLite (EU) is the simpler, cleaner choice — but if you do use AWeber, the
privacy policy already includes the SCC transfer wording.

> The privacy policy is a solid template, not legal advice — give it a final read before publishing.
