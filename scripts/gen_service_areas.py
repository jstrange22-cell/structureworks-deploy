"""Generate the Service-Areas hub + per-city local-SEO pages for StructureWorks.

Run from the site root:  python scripts/gen_service_areas.py
Writes  service-areas.html  and  service-areas/<slug>.html  for each city.
Idempotent — safe to re-run (overwrites). Keeps copy honest/local; no fabricated
project claims.
"""
import os

V = "20260523"
PHONE = "(865) 630-4073"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CITIES = [
    {"slug": "knoxville", "name": "Knoxville", "county": "Knox County", "lat": 35.9606, "lng": -83.9207,
     "blurb": "As a Knoxville-based contractor, StructureWorks is right around the corner for homeowners and businesses from Bearden and West Knoxville to North Knoxville and South Knox."},
    {"slug": "farragut", "name": "Farragut", "county": "Knox County", "lat": 35.8842, "lng": -84.1566,
     "blurb": "We build and remodel throughout Farragut and the Turkey Creek area, from custom homes and additions to decks, roofing, and inspection repairs that keep your sale on track."},
    {"slug": "maryville", "name": "Maryville", "county": "Blount County", "lat": 35.7565, "lng": -83.9705,
     "blurb": "Serving Maryville, Alcoa, and greater Blount County, StructureWorks handles roofing, decks, remodels, and new construction with the quality East Tennessee families expect."},
    {"slug": "oak-ridge", "name": "Oak Ridge", "county": "Anderson County", "lat": 36.0104, "lng": -84.2696,
     "blurb": "From the Oak Ridge core to surrounding Anderson County neighborhoods, we deliver dependable roofing, decks, remodeling, and commercial work backed by a workmanship warranty."},
    {"slug": "lenoir-city", "name": "Lenoir City", "county": "Loudon County", "lat": 35.7973, "lng": -84.2569,
     "blurb": "We serve Lenoir City and the Tellico/Loudon County lakefront communities with custom decks, outdoor living, roofing, and full home renovations built to last."},
    {"slug": "sevierville", "name": "Sevierville", "county": "Sevier County", "lat": 35.8681, "lng": -83.5618,
     "blurb": "Serving Sevierville, Pigeon Forge, and Sevier County, StructureWorks builds and repairs homes, cabins, decks, and roofs for full-time residents and rental owners alike."},
]

def nav():
    return """  <nav id="navbar">
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

def footer():
    return """  <section class="social-bar">
    <div class="container social-bar-inner">
      <span class="social-bar-text">Follow Us</span>
      <div class="social-bar-icons">
        <a href="https://facebook.com/StructureWorksTN" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
        <a href="https://instagram.com/structureworks_tn" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
      </div>
    </div>
  </section>
  <footer class="footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <h3 class="footer-title">StructureWorks</h3>
      <p>East TN's premier construction company specializing in residential and commercial projects with quality craftsmanship and innovative solutions.</p>
      <div class="footer-contact">
        <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <a href="tel:8656304073">(865) 630-4073</a></p>
        <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg> <a href="mailto:info@structureworkstn.com">info@structureworkstn.com</a></p>
        <p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> 410 Montbrook Dr, Ste 104<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Knoxville, TN 37919</p>
      </div>
    </div>
    <div class="footer-links">
      <h4>Services</h4>
      <ul>
        <li><a href="/roofing">Roofing</a></li>
        <li><a href="/decks">Decks &amp; Outdoor</a></li>
        <li><a href="/services">Residential Construction</a></li>
        <li><a href="/services">Commercial Construction</a></li>
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
        <li><a href="/about">About Us</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="https://app.structureworkstn.com">Client Portal</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-cta">
    <div class="container" style="text-align:center;">
      <h3>Ready to Start Your Project?</h3>
      <p>Get a free consultation and quote today</p>
      <a href="/contact" class="btn btn-slate">Get Free Quote</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>&copy; 2026 StructureWorks. All rights reserved. Licensed &amp; Insured.</p>
    </div>
  </div>
</footer>

  <div class="sticky-call">
    <a href="tel:8656304073" class="sc-call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Call Now</a>
    <a href="/contact" class="sc-quote"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg> Free Quote</a>
  </div>
  <script>document.body.classList.add('has-sticky-call');</script>

  <script src="/analytics.js?v=%V%" defer></script>
  <script src="/site.js?v=%V%"></script>
</body>
</html>""".replace("%V%", V)

def head(title, desc, url, og_img="modern-farmhouse-hero.jpg", extra_ld=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/logo-dark.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/site.css?v={V}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="index,follow">
  <meta property="og:site_name" content="StructureWorks">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://structureworkstn.com/img/{og_img}?v={V}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="https://structureworkstn.com/img/{og_img}?v={V}">
{extra_ld}</head>
<body>
"""

FEATURES = """  <section class="section">
    <div class="container">
      <div class="section-header-center">
        <span class="section-tag">What We Do</span>
        <h2 class="section-title">Construction Services in %CITY%</h2>
        <p class="section-subtitle">One local team for roofing, decks, remodels, and new builds.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div><h3>Roofing</h3><p>Replacement, repair, and storm-damage work with insurance help. <a href="/roofing">Roofing &rarr;</a></p></div>
        <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg></div><h3>Decks &amp; Outdoor</h3><p>Composite and wood decks, porches, and outdoor living. <a href="/decks">Decks &rarr;</a></p></div>
        <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div><h3>Remodels &amp; Builds</h3><p>Kitchen &amp; bath, full remodels, additions, and new construction. <a href="/services">Services &rarr;</a></p></div>
        <div class="feature-card"><div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><h3>AgentWorks</h3><p>Fast inspection repairs for real estate agents. <a href="/agentworks">AgentWorks &rarr;</a></p></div>
      </div>
    </div>
  </section>
"""

def city_form(slug):
    return f"""  <section class="section section-light" id="quote">
    <div class="container">
      <div class="contact-form-wrapper" style="max-width:620px; margin:0 auto;">
        <h3>Get a Free Quote</h3>
        <p style="color:#64748b; margin-bottom:20px; font-size:0.95rem;">Tell us about your project — we respond within 24 hours.</p>
        <form class="contact-form" onsubmit="handleSubmit(event)">
          <input type="hidden" name="source" value="service_area_{slug.replace('-','_')}">
          <input type="hidden" name="projectType" value="General Construction Inquiry">
          <div class="hp-field" aria-hidden="true"><label for="company_website">Company Website</label><input type="text" id="company_website" name="company_website" tabindex="-1" autocomplete="off"></div>
          <div class="form-row">
            <div class="form-group"><label for="name">Full Name *</label><input type="text" id="name" name="name" placeholder="Your name" required></div>
            <div class="form-group"><label for="phone">Phone *</label><input type="tel" id="phone" name="phone" placeholder="(865) 555-0000" required></div>
          </div>
          <div class="form-group"><label for="address">Property Address or ZIP</label><input type="text" id="address" name="address" placeholder="Street address or ZIP"></div>
          <div class="form-group"><label for="details">What do you need?</label><textarea id="details" name="details" rows="3" placeholder="Roofing, deck, remodel, new build..."></textarea></div>
          <button type="submit" class="btn btn-primary btn-lg btn-full">Get My Free Quote</button>
          <p class="form-note">No obligation. We'll call you within 24 hours.</p>
        </form>
      </div>
    </div>
  </section>
"""

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("  +", path)

def build_city(c):
    url = f"https://structureworkstn.com/service-areas/{c['slug']}"
    title = f"{c['name']} Contractor | Roofing, Decks &amp; Remodeling — StructureWorks"
    desc = f"StructureWorks is a licensed &amp; insured contractor serving {c['name']}, TN ({c['county']}). Roofing, decks, remodels, and new construction. Free quotes. Call {PHONE}."
    ld = f"""  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "name": "StructureWorks",
    "@id": "https://structureworkstn.com/#business",
    "url": "{url}",
    "image": "https://structureworkstn.com/img/modern-farmhouse-hero.jpg",
    "telephone": "+1-865-630-4073",
    "email": "info@structureworkstn.com",
    "priceRange": "$$",
    "address": {{"@type":"PostalAddress","streetAddress":"410 Montbrook Dr, Ste 104","addressLocality":"Knoxville","addressRegion":"TN","postalCode":"37919","addressCountry":"US"}},
    "areaServed": {{"@type":"City","name":"{c['name']}, TN"}},
    "geo": {{"@type":"GeoCoordinates","latitude":{c['lat']},"longitude":{c['lng']}}},
    "sameAs": ["https://facebook.com/StructureWorksTN","https://instagram.com/structureworks_tn","https://linkedin.com/company/structureworks"]
  }}
  </script>
"""
    hero = f"""  <section class="hero hero-image-bg" style="background-image: url('/img/modern-farmhouse-hero.jpg?v={V}'); min-height:auto; padding:130px 0 64px;">
    <div class="hero-overlay"></div>
    <div class="hero-bg"></div>
    <div class="container hero-content">
      <span class="section-tag" style="color:#fff; background:rgba(255,255,255,0.15);">{c['county']}, Tennessee</span>
      <h1>Your {c['name']} <span class="accent">Construction Contractor</span></h1>
      <p class="hero-sub">{c['blurb']}</p>
      <div class="hero-buttons">
        <a href="#quote" class="btn btn-primary btn-lg">Get a Free Quote <span class="arrow">&rarr;</span></a>
        <a href="tel:8656304073" class="btn btn-outline btn-lg">Call (865) 630-4073</a>
      </div>
    </div>
  </section>
"""
    trust = """  <div class="trust-strip"><div class="container trust-row">
      <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Licensed &amp; Insured</span>
      <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Locally Owned</span>
      <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Workmanship Warranty</span>
      <span class="trust-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Free Estimates</span>
  </div></div>
"""
    cta = """  <section class="section cta-section"><div class="container cta-content">
      <h2>Let's Build Something in %CITY%</h2>
      <p>Free, no-obligation quote — we respond within 24 hours.</p>
      <div class="hero-buttons" style="justify-content:center; margin-top:24px;">
        <a href="tel:8656304073" class="btn btn-slate btn-lg">Call (865) 630-4073</a>
        <a href="#quote" class="btn btn-outline btn-lg">Request Online</a>
      </div>
  </div></section>
""".replace("%CITY%", c["name"])
    body = (hero + trust + FEATURES.replace("%CITY%", c["name"]) + city_form(c["slug"]) + cta + footer())
    write(f"service-areas/{c['slug']}.html", head(title, desc, url, extra_ld=ld) + nav() + "\n" + body)

def build_hub():
    url = "https://structureworkstn.com/service-areas"
    title = "Service Areas | Knoxville &amp; East Tennessee — StructureWorks"
    desc = "StructureWorks serves Knoxville, Farragut, Maryville, Oak Ridge, Lenoir City, Sevierville and across East Tennessee with roofing, decks, remodels, and new construction."
    cards = "\n".join(
        f"""        <a href="/service-areas/{c['slug']}" class="feature-card" style="text-decoration:none; display:block;">
          <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <h3>{c['name']}, TN</h3><p>{c['county']} &mdash; roofing, decks, remodels &amp; new construction. <span style="color:#2563eb;font-weight:600;">View &rarr;</span></p>
        </a>""" for c in CITIES)
    hero = f"""  <section class="page-hero"><div class="container">
      <h1>Serving Knoxville &amp; East Tennessee</h1>
      <p>Local, licensed, and insured — StructureWorks builds and repairs across the East TN communities below. Don't see your town? <a href="/contact" style="color:#93c5fd;">Just ask</a>.</p>
  </div></section>
  <section class="section"><div class="container"><div class="features-grid">
{cards}
  </div></div></section>
"""
    write("service-areas.html", head(title, desc, url) + nav() + "\n" + hero + footer())

if __name__ == "__main__":
    print("Generating service-area pages:")
    build_hub()
    for c in CITIES:
        build_city(c)
    print(f"Done. Hub + {len(CITIES)} city pages.")
