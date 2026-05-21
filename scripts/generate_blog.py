"""Auto-generate one SEO-optimized StructureWorks blog post (East-TN construction).

Discovers a fresh topic (deduped against existing posts), writes the post with the
Anthropic API, renders it to the site's blog-post template, prepends a card to
blog.html, and adds the URL to sitemap.xml. Designed to run unattended in CI.

Run from the site root:
    ANTHROPIC_API_KEY=... python scripts/generate_blog.py

Env:
    ANTHROPIC_API_KEY  (required)
    ANTHROPIC_MODEL    (optional, default 'claude-sonnet-4-5')
"""
import datetime as _dt
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(ROOT, "blog")
USED_PATH = os.path.join(ROOT, "scripts", "blog_topics_used.json")
V = "20260523"
MODEL = os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-5"

CATEGORY_IMG = {
    "Roofing": "roofing-hero.jpg",
    "Decks & Outdoor": "deck-1.jpg",
    "Remodeling": "blog-kitchen.jpg",
    "New Construction": "modern-farmhouse-hero.jpg",
    "Maintenance": "residential-construction.jpg",
    "Real Estate": "real-estate-agents.jpg",
}
DEFAULT_IMG = "modern-farmhouse-hero.jpg"

SEED_THEMES = [
    "roof maintenance and storm prep for East Tennessee homes",
    "choosing decking materials for the Knoxville climate",
    "kitchen and bath remodel planning and budgeting in East TN",
    "new home construction process and timelines in Knox/Blount County",
    "metal buildings, shops, and light commercial construction",
    "preparing a home for sale: inspection repairs that matter",
    "energy efficiency and moisture control for humid East-TN summers",
    "permitting and code basics for Tennessee homeowners",
    "outdoor living: screened porches, pergolas, and patios",
    "siding, gutters, and exterior maintenance for East TN weather",
]

NAV = """  <nav id="navbar">
  <div class="container nav-container">
    <a href="/" class="nav-logo">
      <img src="/img/logo-full-light.png?v=%V%" alt="StructureWorks" class="logo-light">
      <img src="/img/logo-full-dark.png?v=%V%" alt="StructureWorks" class="logo-dark">
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/services">Services</a></li>
      <li><a href="/gallery">Projects</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/agentworks" class="nav-agentworks">AgentWorks</a></li>
    </ul>
    <div class="nav-right">
      <a href="tel:8656304073" class="nav-phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        (865) 630-4073
      </a>
      <a href="/contact" class="btn btn-primary nav-cta">Get Free Quote</a>
    </div>
    <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</nav>""".replace("%V%", V)

FOOTER = """  <section class="section cta-section">
    <div class="container cta-content">
      <h2>Ready to Start Your Project?</h2>
      <p>Get a free consultation and quote for your construction project.</p>
      <a href="/contact" class="btn btn-slate btn-lg">Get Free Quote</a>
    </div>
  </section>
  <footer class="footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <h3 class="footer-title">StructureWorks</h3>
      <p>East TN's premier construction company specializing in residential and commercial projects with quality craftsmanship and innovative solutions.</p>
      <div class="footer-contact">
        <p><a href="tel:8656304073">(865) 630-4073</a></p>
        <p><a href="mailto:info@structureworkstn.com">info@structureworkstn.com</a></p>
        <p>410 Montbrook Dr, Ste 104, Knoxville, TN 37919</p>
      </div>
    </div>
    <div class="footer-links">
      <h4>Services</h4>
      <ul>
        <li><a href="/roofing">Roofing</a></li>
        <li><a href="/decks">Decks &amp; Outdoor</a></li>
        <li><a href="/services">Residential Construction</a></li>
        <li><a href="/agentworks">AgentWorks</a></li>
        <li><a href="/financing">Financing</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/gallery">Projects</a></li>
        <li><a href="/service-areas">Service Areas</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>&copy; 2026 StructureWorks. All rights reserved. Licensed &amp; Insured.</p>
    </div>
  </div>
</footer>
  <script src="/site.js?v=%V%"></script>
</body>
</html>""".replace("%V%", V)


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def slugify(t):
    s = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return s[:70].strip("-")


def load_used():
    if os.path.exists(USED_PATH):
        try:
            return json.load(open(USED_PATH, encoding="utf-8"))
        except Exception:
            pass
    return {"slugs": [], "titles": []}


def existing_titles():
    titles = []
    if os.path.isdir(BLOG_DIR):
        for f in os.listdir(BLOG_DIR):
            if f.endswith(".html"):
                m = re.search(r"<title>(.*?)</title>", open(os.path.join(BLOG_DIR, f), encoding="utf-8").read())
                if m:
                    titles.append(m.group(1))
    return titles


def call_claude(used_titles):
    import anthropic
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = (
        "You are the content writer for StructureWorks, a licensed, insured general contractor in "
        "Knoxville / East Tennessee (roofing, decks & outdoor living, kitchen/bath & full remodels, "
        "new construction, metal buildings & light commercial, and AgentWorks inspection repairs for "
        "real estate agents). Write ONE fresh, genuinely useful, SEO-optimized blog post for local "
        "homeowners and agents.\n\n"
        "Pick a SPECIFIC, locally-relevant angle (East TN climate, Knox/Blount/Loudon/Sevier counties, "
        "local seasons). Themes to draw from: " + "; ".join(SEED_THEMES) + ".\n\n"
        "Do NOT duplicate or closely overlap any of these existing titles:\n- " + "\n- ".join(used_titles) + "\n\n"
        "Rules: helpful and accurate; NO fabricated statistics, prices, or studies; keep any cost talk "
        "general (ranges/factors, not invented numbers); natural Knoxville/East-TN voice; E-E-A-T; "
        "800-1100 words. Return STRICT JSON only (no markdown, no commentary) with this shape:\n"
        "{\n"
        '  "title": "<= 65 chars, includes a local hook",\n'
        '  "metaDescription": "<= 155 chars",\n'
        '  "excerpt": "1 sentence, <= 160 chars",\n'
        '  "category": one of ["Roofing","Decks & Outdoor","Remodeling","New Construction","Maintenance","Real Estate"],\n'
        '  "tags": ["three","short","tags"],\n'
        '  "readMin": integer,\n'
        '  "sections": [ {"heading":"H2 text","body":["paragraph", "paragraph"], "bullets":["optional","list"]} ]\n'
        "}\n"
        "Include 4-6 sections; exactly one section may include a non-empty bullets array. "
        "Weave in one natural internal-link suggestion to /roofing, /decks, /agentworks, or /contact "
        "inside a paragraph using markdown like [free quote](/contact)."
    )
    msg = client.messages.create(
        model=MODEL, max_tokens=4000, temperature=0.8,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?|\n?```$", "", text).strip()
    i, j = text.find("{"), text.rfind("}")
    return json.loads(text[i:j + 1])


_LINK = re.compile(r"\[([^\]]+)\]\((/[a-z\-]+)\)")

def md_links(s):
    return _LINK.sub(lambda m: f'<a href="{m.group(2)}">{esc(m.group(1))}</a>', esc(s).replace("&lt;", "<"))

def para(s):
    # escape, then re-enable our markdown links
    out = esc(s)
    out = re.sub(r"\[([^\]]+)\]\((/[a-z\-]+)\)", r'<a href="\2">\1</a>', out)
    return out


def render_post(d, slug, date_iso, date_human):
    img = CATEGORY_IMG.get(d["category"], DEFAULT_IMG)
    url = f"https://structureworkstn.com/blog/{slug}"
    body = []
    for sec in d["sections"]:
        body.append(f"    <h2>{esc(sec['heading'])}</h2>")
        for p in sec.get("body", []):
            body.append(f"    <p>{para(p)}</p>")
        if sec.get("bullets"):
            body.append("    <ul>")
            for b in sec["bullets"]:
                body.append(f"      <li>{para(b)}</li>")
            body.append("    </ul>")
    article = "\n".join(body)
    ld = {
        "@context": "https://schema.org", "@type": "BlogPosting",
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "headline": d["title"], "description": d["metaDescription"],
        "image": f"https://structureworkstn.com/img/{img}",
        "datePublished": date_iso, "dateModified": date_iso,
        "author": {"@type": "Organization", "name": "StructureWorks"},
        "publisher": {"@type": "Organization", "name": "StructureWorks",
                      "logo": {"@type": "ImageObject", "url": f"https://structureworkstn.com/img/logo-full-dark.png?v={V}"}},
    }
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(d['title'])} - StructureWorks Blog</title>
  <meta name="description" content="{esc(d['metaDescription'])}">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/logo-dark.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/site.css?v={V}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="index,follow">
  <meta property="og:site_name" content="StructureWorks">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{esc(d['title'])}">
  <meta property="og:description" content="{esc(d['metaDescription'])}">
  <meta property="og:image" content="https://structureworkstn.com/img/{img}?v={V}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(d['title'])}">
  <meta name="twitter:description" content="{esc(d['metaDescription'])}">
  <meta name="twitter:image" content="https://structureworkstn.com/img/{img}?v={V}">
  <script type="application/ld+json">
{json.dumps(ld, indent=2)}
  </script>
</head>
<body>
{NAV}

  <section class="blog-post-hero">
    <div class="container">
      <span class="blog-category">{esc(d['category'])}</span>
      <h1>{esc(d['title'])}</h1>
      <p class="blog-meta">{date_human} &middot; {int(d.get('readMin', 7))} min read</p>
    </div>
  </section>

  <article class="blog-post-content">
{article}
  </article>

{FOOTER}
"""


def blog_card(d, slug, date_human, img):
    tags = "".join(f'<span class="blog-tag">{esc(t)}</span>' for t in d.get("tags", [])[:3])
    return f"""        <div class="blog-card">
          <div class="blog-card-image" style="background-image: url('/img/{img}?v={V}');">
            <span class="blog-category">{esc(d['category'])}</span>
          </div>
          <div class="blog-card-body">
            <p class="blog-date">{date_human}</p>
            <h3><a href="/blog/{slug}">{esc(d['title'])}</a></h3>
            <p class="blog-excerpt">{esc(d['excerpt'])}</p>
            <div class="blog-tags">{tags}</div>
            <a href="/blog/{slug}" class="blog-read-more">Read More &rarr;</a>
          </div>
        </div>
"""


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY not set")
    used = load_used()
    used_titles = list(dict.fromkeys(existing_titles() + used.get("titles", [])))
    d = call_claude(used_titles)

    slug = slugify(d.get("slug") or d["title"])
    if not slug:
        sys.exit("Empty slug from model output")
    base, n = slug, 2
    while os.path.exists(os.path.join(BLOG_DIR, slug + ".html")) or slug in used.get("slugs", []):
        slug = f"{base}-{n}"; n += 1

    today = _dt.date.today()
    date_iso = today.isoformat()
    date_human = today.strftime("%B %-d, %Y") if os.name != "nt" else today.strftime("%B %#d, %Y")
    img = CATEGORY_IMG.get(d["category"], DEFAULT_IMG)

    # 1) write the post
    os.makedirs(BLOG_DIR, exist_ok=True)
    with open(os.path.join(BLOG_DIR, slug + ".html"), "w", encoding="utf-8") as f:
        f.write(render_post(d, slug, date_iso, date_human))

    # 2) prepend a card to blog.html
    bp = os.path.join(ROOT, "blog.html")
    s = open(bp, encoding="utf-8").read()
    anchor = '<div class="blog-grid">'
    s = s.replace(anchor, anchor + "\n" + blog_card(d, slug, date_human, img), 1)
    open(bp, "w", encoding="utf-8").write(s)

    # 3) add to sitemap.xml
    sp = os.path.join(ROOT, "sitemap.xml")
    sm = open(sp, encoding="utf-8").read()
    entry = (f"  <url>\n    <loc>https://structureworkstn.com/blog/{slug}</loc>\n"
             f"    <lastmod>{date_iso}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.6</priority>\n  </url>\n")
    sm = sm.replace("</urlset>", entry + "</urlset>", 1)
    open(sp, "w", encoding="utf-8").write(sm)

    # 4) record topic
    used.setdefault("slugs", []).append(slug)
    used.setdefault("titles", []).append(d["title"])
    json.dump(used, open(USED_PATH, "w", encoding="utf-8"), indent=2)

    print(f"Created blog/{slug}.html  |  {d['title']}  |  {d['category']}")


if __name__ == "__main__":
    main()
