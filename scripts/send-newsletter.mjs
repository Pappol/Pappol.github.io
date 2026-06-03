// Automatic "new post" newsletter sender.
//
// WHAT IT DOES
//   Emails subscribers (via the MailerLite API) once, the first time a blog
//   post is *released* — i.e. the first time a non-draft post appears that we
//   have not emailed before. Editing or deleting an existing post never sends
//   anything, because the trigger is "slug not seen before", not "file
//   changed".
//
//   State lives in .newsletter/sent.json (a list of already-notified slugs).
//   The GitHub Actions `notify` job runs this after each deploy and commits the
//   updated list back to the repo.
//
// REQUIRED ENV (set as GitHub repo secrets, see PUBLISHING.md):
//   MAILERLITE_API_KEY     - API token with campaign permissions
//   MAILERLITE_GROUP_ID    - the subscriber group the website form feeds into
//   MAILERLITE_FROM_EMAIL  - a *verified* sender address in MailerLite
// OPTIONAL ENV:
//   MAILERLITE_FROM_NAME   - defaults to the author name below
//   SITE_URL               - defaults to https://pappol.github.io
//
// If MAILERLITE_API_KEY is unset the script is a no-op (exit 0), so the deploy
// stays green for anyone who hasn't configured the secrets yet.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const STATE_DIR = path.join(ROOT, '.newsletter');
const STATE_FILE = path.join(STATE_DIR, 'sent.json');

const SITE_URL = (process.env.SITE_URL || 'https://pappol.github.io').replace(/\/$/, '');
const API_KEY = process.env.MAILERLITE_API_KEY;
const GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const FROM_EMAIL = process.env.MAILERLITE_FROM_EMAIL;
const FROM_NAME = process.env.MAILERLITE_FROM_NAME || 'Riccardo Parola';

// --- tiny frontmatter reader (no deps) -------------------------------------
// Posts use simple, flat YAML frontmatter. We only need title, description and
// the draft flag, all of which are plain scalars — so a minimal parser is safe.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    // strip a trailing inline comment that isn't inside quotes
    if (!/^["']/.test(val)) val = val.replace(/\s+#.*$/, '').trim();
    // unwrap matching surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function loadPosts() {
  const files = (await readdir(BLOG_DIR)).filter((f) => /\.(md|mdx)$/.test(f));
  const posts = [];
  for (const file of files) {
    const raw = await readFile(path.join(BLOG_DIR, file), 'utf8');
    const fm = parseFrontmatter(raw);
    posts.push({
      slug: file.replace(/\.(md|mdx)$/, '').toLowerCase(),
      title: fm.title || '',
      description: fm.description || '',
      draft: String(fm.draft).toLowerCase() === 'true',
    });
  }
  return posts;
}

async function loadState() {
  if (!existsSync(STATE_FILE)) return { sent: [] };
  try {
    const data = JSON.parse(await readFile(STATE_FILE, 'utf8'));
    return { sent: Array.isArray(data.sent) ? data.sent : [] };
  } catch {
    return { sent: [] };
  }
}

async function saveState(state) {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// --- email -----------------------------------------------------------------
function buildHtml(post) {
  const url = `${SITE_URL}/blog/${post.slug}/`;
  // Minimal, monochrome, inline-styled — matches the blog's aesthetic and
  // renders reliably across email clients.
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;color:#111111;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr><td style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#777;padding-bottom:8px;">New post</td></tr>
            <tr><td style="font-size:24px;line-height:1.3;font-weight:700;padding-bottom:12px;">${escapeHtml(post.title)}</td></tr>
            <tr><td style="font-size:16px;line-height:1.6;color:#333;padding-bottom:24px;">${escapeHtml(post.description)}</td></tr>
            <tr><td style="padding-bottom:32px;">
              <a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:8px;">Read it &rarr;</a>
            </td></tr>
            <tr><td style="border-top:1px solid #eee;padding-top:16px;font-size:12px;line-height:1.6;color:#999;">
              You're getting this because you subscribed at ${escapeHtml(SITE_URL)}.<br>
              <a href="{$unsubscribe}" style="color:#999;">Unsubscribe</a> &middot;
              <a href="${SITE_URL}/privacy" style="color:#999;">Privacy</a>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function mlFetch(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`MailerLite ${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  return json;
}

async function sendCampaign(post) {
  const created = await mlFetch('https://connect.mailerlite.com/api/campaigns', {
    name: `New post: ${post.title}`.slice(0, 250),
    type: 'regular',
    emails: [
      {
        subject: `New post: ${post.title}`.slice(0, 250),
        from_name: FROM_NAME,
        from: FROM_EMAIL,
        content: buildHtml(post),
      },
    ],
    groups: [GROUP_ID],
  });

  const id = created?.data?.id;
  if (!id) throw new Error(`No campaign id returned: ${JSON.stringify(created)}`);

  await mlFetch(`https://connect.mailerlite.com/api/campaigns/${id}/schedule`, {
    delivery: 'instant',
  });

  return id;
}

// --- main ------------------------------------------------------------------
async function main() {
  const state = await loadState();
  const posts = await loadPosts();
  const seen = new Set(state.sent);

  const toSend = posts.filter((p) => !p.draft && p.title && !seen.has(p.slug));

  if (toSend.length === 0) {
    console.log('Newsletter: no newly released posts. Nothing to send.');
    return;
  }

  console.log(`Newsletter: ${toSend.length} new post(s) to announce: ${toSend.map((p) => p.slug).join(', ')}`);

  if (!API_KEY) {
    console.log('Newsletter: MAILERLITE_API_KEY not set — skipping send (state left unchanged).');
    return;
  }
  if (!GROUP_ID || !FROM_EMAIL) {
    throw new Error('Newsletter: MAILERLITE_GROUP_ID and MAILERLITE_FROM_EMAIL are required to send.');
  }

  for (const post of toSend) {
    const id = await sendCampaign(post);
    console.log(`Newsletter: sent campaign ${id} for "${post.slug}".`);
    state.sent.push(post.slug);
    // Persist after each success so a mid-run failure never re-sends earlier ones.
    await saveState(state);
  }

  console.log('Newsletter: done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
