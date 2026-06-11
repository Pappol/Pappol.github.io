---
# REQUIRED — shown in the browser tab and post header
title: "Your Post Title Here"

# REQUIRED — shown as the subtitle under the title; also used for SEO meta description
description: "A one-sentence summary of what this post is about."

# REQUIRED — ISO date, no time needed
pubDate: 2026-06-11

# OPTIONAL — set this if you later revise the post
# updatedDate: 2026-07-01

# OPTIONAL — set to true to hide the post from the blog index while you're still writing
draft: true

# OPTIONAL — one or more short labels (lowercase, no spaces)
tags: ["data-engineering", "python", "rag"]

# OPTIONAL — hero / banner image shown at the top of the post (16:9 crop)
# Place the file in public/images/posts/ and reference it from the root:
# heroImage: "/images/posts/my-post-hero.jpg"
# heroImageAlt: "A short description of the image (for screen readers and SEO)"
---

Opening paragraph — no heading needed here. Get straight to the point. This text renders
directly below the title and description so there is no need to repeat yourself.

## First section heading

Body text goes here. Standard Markdown: **bold**, _italic_, `inline code`, [links](https://example.com).

### Sub-heading (use sparingly)

A level-three heading is fine for a long post. Avoid going deeper — h4+ rarely helps readability.

## Adding images inside the post

Use a standard Markdown image tag. The path must start with `/` and points into the `public/` folder:

```
![Alt text describing the image](/images/posts/my-diagram.png)
```

Steps:
1. Drop the file into `public/images/posts/` (create the folder if it doesn't exist yet).
2. Reference it as `/images/posts/filename.ext` — Astro serves everything in `public/` at the root.
3. Always write a descriptive alt text (accessibility + SEO).

For a wider caption-style figure you can wrap it in HTML directly in the Markdown file:

```html
<figure>
  <img src="/images/posts/my-diagram.png" alt="Alt text" />
  <figcaption>Caption goes here.</figcaption>
</figure>
```

## Code blocks

Fenced code blocks with a language hint get syntax highlighting:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

```bash
npm run dev
```

## Blockquotes

> Use blockquotes for pull-quotes or citations. Keep them short.

## Lists

- Unordered item
- Another item

1. Ordered item
2. Another item

## Finishing up

When the post is ready to publish:
1. Remove (or delete) the `draft: true` line — or set it to `false`.
2. If you added a hero image, make sure the file is committed inside `public/images/posts/`.
3. Run `npm run build` locally to catch any frontmatter validation errors before pushing.
