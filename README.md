# ToySwap — support &amp; privacy site

The public privacy policy and support portal for the **ToySwap** iPhone app
(`com.tyswenson.ToySwap`). These two URLs are what App Store Connect's *Privacy Policy
URL* and *Support URL* point at, and what the in-app Privacy and Help rows open.

| Page | URL | What it is for |
|---|---|---|
| Home | `/` | A hub, so the bare domain is not a 404 for a reviewer who trims the path |
| Support | `/support` | The published developer contact method (Guideline 1.2), plus in-app report/block/delete instructions |
| Privacy Policy | `/privacy` | Guideline 5.1.1 disclosure, GDPR/UK GDPR and CCPA/CPRA rights |

## Deliberately boring

Plain HTML, one stylesheet, one small script. **No framework, no build step, no
dependencies, no server code, no environment variables, no secrets.** Vercel serves the
files as they are.

That is the point rather than laziness: these pages have to be reachable on the day an
App Store reviewer opens them, and every moving part is something that can be broken by
a dependency bump nobody was watching. There is nothing here to bump.

## The support form sends no data anywhere

`/support` composes a `mailto:` link from what you type and hands it to your mail app.
**Nothing is posted, stored or transmitted by this site.** The address is also written in
the page as plain text, so it survives JavaScript being off, `support.js` failing to
load, and no mail handler being registered — and the clipboard button is there for the
last of those.

A form that POSTed to a serverless function would need a mail-sending account, an API key
in an environment variable, and a delivery path that can rot silently. A published address
cannot rot.

## Changing the support address

It appears in four files. Change all four together:

```
index.html      footer
support.html    the "Email us" card (link + copy button), the footer
privacy.html    sections 1, 8, 9, 13, and the footer
404.html        footer
assets/support.js   SUPPORT_EMAIL, line ~14
```

```bash
grep -rn 'tyswenson34@gmail.com' . --exclude-dir=.git
```

## Keeping the policy honest

`privacy.html` was written from two audited sources in the app repo, not from a template:

- `App/PrivacyInfo.xcprivacy` — Apple's privacy manifest, which is the list of data types
  the App Store label is built from
- `supabase/migrations/` — what the schema actually stores

**If either changes, this policy is wrong until it is updated.** In particular: adding a
column that holds personal data, adding a third-party SDK, or changing where the database
is hosted all need an edit here and a new "Last updated" date.

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Note that plain `http.server` does not apply `vercel.json`, so `/privacy` will 404 —
use `/privacy.html` locally. `vercel dev` honours the rewrites if you want the real thing.

## Deploying

Pushes to `main` deploy to production automatically through the Vercel Git integration.
