/* SW Roofing division patch for structureworkstn.com.
 * Pure string transforms on the LIVE site files, so nothing newer on the server is lost.
 * Every edit asserts its anchor appears exactly once, and is idempotent (safe to re-run).
 * Used by apply.mjs (Node, at deploy) and pasted as-is into a browser to verify against live.
 * Defines globalThis.SWDIV = { VERSION, CITIES, applyAll }. */
(function (root) {
  'use strict';

  var VERSION = '20261112';
  var TODAY = '2026-11-12';
  var SITE = 'https://structureworkstn.com';
  var MARK = '<!-- sw-division ' + VERSION + ' -->';
  var NAV_SERVICES = '<li><a href="/services">Services</a></li>';
  var NAV_ROOFING = '<li><a href="/roofing">Roofing</a></li>';
  var PHONE_TEL = 'tel:8656304073';

  var CITIES = [
    { slug: 'knoxville', name: 'Knoxville', county: 'Knox County',
      lede: 'Roof replacement, roof repair and storm damage work for Knoxville homes, from West Knoxville and Bearden to Fountain City, Halls and South Knoxville.',
      intro: [
        'Knoxville is home base for SW Roofing. Our office is on Montbrook Lane, so a free on-site inspection anywhere in the city is a short drive, and we respond to every request within 24 hours.',
        'Many Knox County neighborhoods were built in the housing boom of the mid-2000s, and a lot of those original asphalt roofs are reaching the end of their life now. If your shingles are curling, losing granules or leaking around flashing, an inspection tells you whether a repair will do or the roof needs replacing.'
      ],
      points: [
        ['Close to home', 'Based in West Knoxville, with crews working across Knox County every week.'],
        ['Storm documentation', 'Photo reports for wind and hail damage, and we meet your adjuster on site.'],
        ['One contract', 'Roofing, gutters and exterior work under one StructureWorks contract.']
      ],
      faq: [
        ['Do you replace roofs in all of Knoxville?', 'Yes. SW Roofing works across Knoxville and the rest of Knox County, including Bearden, West Knoxville, Fountain City, Halls, Powell and South Knoxville.'],
        ['How fast can someone look at my roof in Knoxville?', 'We respond within 24 hours and schedule a free, no-obligation inspection at a time that suits you.'],
        ['Can you help with a storm damage claim in Knoxville?', 'Yes. We document wind and hail damage with photos and a written report, and we can meet your insurance adjuster at the house.']
      ] },
    { slug: 'farragut', name: 'Farragut', county: 'Knox County',
      lede: 'Roof replacement and repair for Farragut homes, with free on-site inspections and a workmanship warranty on every roof we install.',
      intro: [
        'Farragut neighborhoods are mostly larger two-story homes with complex rooflines, valleys and dormers, where flashing and valley work matter as much as the shingles. SW Roofing inspects the whole roof system, not just the field shingles.',
        'Our office is a few minutes away in West Knoxville, so we can usually be on your roof within a day or two of your request, and we respond to every request within 24 hours.'
      ],
      points: [
        ['Complex rooflines', 'Valleys, dormers and steep pitches flashed and installed to manufacturer spec.'],
        ['Material choices', 'Architectural shingles, 3-tab and standing-seam metal, compared at your inspection.'],
        ['Clean job sites', 'Full magnetic nail sweep and debris haul-off when the roof is done.']
      ],
      faq: [
        ['Do you work in Farragut neighborhoods with an HOA?', 'Yes. Tell us your HOA’s roofing rules and we will price materials and colors that fit them, so you can submit the details for approval before work starts.'],
        ['How long does a roof replacement take in Farragut?', 'Most homes take one to three days once materials are on site, depending on size, pitch and weather.'],
        ['Is the inspection really free?', 'Yes. The on-site inspection is free and comes with photos of what we found and no obligation.']
      ] },
    { slug: 'maryville', name: 'Maryville', county: 'Blount County',
      lede: 'Roof replacement, repair and storm damage work for Maryville and Alcoa homes across Blount County.',
      intro: [
        'SW Roofing serves Maryville, Alcoa and the rest of Blount County from our Knoxville office. We inspect, document and replace roofs on everything from older brick ranches to new construction.',
        'Every inspection is free, comes with photo documentation, and ends with a clear written estimate and material options, plus guidance if storm damage means an insurance claim.'
      ],
      points: [
        ['Blount County coverage', 'Maryville, Alcoa and surrounding Blount County communities.'],
        ['Written estimates', 'Itemized, with material options, so you can compare like for like.'],
        ['Financing available', 'Check monthly payment options through Hearth without affecting your credit score.']
      ],
      faq: [
        ['Do you serve Maryville and Alcoa?', 'Yes. SW Roofing works throughout Blount County, including Maryville and Alcoa.'],
        ['What roofing materials do you install in Maryville?', 'Architectural (dimensional) asphalt shingles, 3-tab shingles and standing-seam metal. We help you choose at the free inspection.'],
        ['Can I finance a new roof?', 'Yes. Financing is offered through Hearth, a third-party lending platform, and checking your options does not affect your credit score.']
      ] },
    { slug: 'oak-ridge', name: 'Oak Ridge', county: 'Anderson County',
      lede: 'Roof replacement and repair for Oak Ridge homes, including older original-construction houses and newer neighborhoods.',
      intro: [
        'Oak Ridge has some of the region’s oldest planned housing alongside newer subdivisions, so roofs here range from decades-old re-roofs to recent installs. SW Roofing checks decking, ventilation and flashing, not just shingles, before recommending a repair or a replacement.',
        'We serve Oak Ridge and Anderson County from our Knoxville office, respond within 24 hours, and back every installed roof with a workmanship warranty.'
      ],
      points: [
        ['Whole-system inspection', 'Decking, ventilation, flashing and gutters checked with photos.'],
        ['Repair or replace', 'An honest call on whether a repair will hold or the roof is done.'],
        ['Warranty-backed', 'Manufacturer warranties on materials and our workmanship warranty on the install.']
      ],
      faq: [
        ['Do you serve all of Oak Ridge?', 'Yes. SW Roofing works across Oak Ridge and Anderson County.'],
        ['My roof is old. Can it be repaired instead of replaced?', 'Sometimes. We inspect the decking, flashing and shingles and tell you plainly whether a repair will hold or a replacement is the better spend.'],
        ['Do you fix gutters and attic ventilation too?', 'Yes. Gutter replacement, ridge vents and attic ventilation upgrades are part of our roofing work.']
      ] },
    { slug: 'lenoir-city', name: 'Lenoir City', county: 'Loudon County',
      lede: 'Roof replacement, repair and storm damage work for Lenoir City and Loudon County homes, including lake homes.',
      intro: [
        'SW Roofing serves Lenoir City and the rest of Loudon County, from in-town homes to lake houses with long, exposed roof runs that take the brunt of wind.',
        'Every job starts with a free inspection and photo documentation. If wind or hail did the damage, we write it up for your insurer and can meet your adjuster on site.'
      ],
      points: [
        ['Wind-exposed homes', 'Shingles and metal systems rated for high wind, installed to spec.'],
        ['Storm claims', 'Photo reports and adjuster meetings for wind and hail damage.'],
        ['24-hour response', 'We reply to every request within a day.']
      ],
      faq: [
        ['Do you work on lake homes around Lenoir City?', 'Yes. We roof homes throughout Loudon County, including lake properties.'],
        ['What wind rating do your shingles have?', 'The architectural shingles we install carry wind ratings up to 130 mph, depending on the product and installation method.'],
        ['How do I get started?', 'Book a free on-site inspection with the form on this page or call (865) 630-4073.']
      ] },
    { slug: 'sevierville', name: 'Sevierville', county: 'Sevier County',
      lede: 'Roof replacement and repair for Sevierville and Sevier County homes, cabins and rental properties.',
      intro: [
        'SW Roofing serves Sevierville and Sevier County, including homes, cabins and short-term rentals where a leak means lost bookings as well as repairs.',
        'We respond within 24 hours, inspect for free, and schedule the work to keep downtime short. Most replacements take one to three days once materials are on site.'
      ],
      points: [
        ['Cabins and rentals', 'Scheduling built around bookings to keep downtime short.'],
        ['Metal roofing', 'Standing-seam metal for long life on mountain homes.'],
        ['One crew, one contract', 'Roofing plus decks and exterior work through StructureWorks.']
      ],
      faq: [
        ['Do you roof cabins and rental properties in Sevier County?', 'Yes. We work on homes, cabins and short-term rentals throughout Sevier County and plan the schedule around your bookings.'],
        ['Do you install metal roofs in Sevierville?', 'Yes. We install standing-seam metal as well as architectural and 3-tab asphalt shingles.'],
        ['How long will my rental be out of service?', 'Most roof replacements take one to three days once materials are on site, depending on size and weather.']
      ] }
  ];

  /* ---------- helpers ---------- */
  function count(hay, needle) { var n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; } return n; }
  function once(html, needle, label) {
    var n = count(html, needle);
    if (n !== 1) throw new Error(label + ': expected 1 match, found ' + n);
    return html.indexOf(needle);
  }
  function replaceOnce(html, find, repl, label) { var i = once(html, find, label); return html.slice(0, i) + repl + html.slice(i + find.length); }
  function replaceRe(html, re, repl, label) {
    var m = html.match(new RegExp(re.source, re.flags.replace('g', '') + 'g'));
    if (!m || m.length !== 1) throw new Error(label + ': expected 1 match, found ' + (m ? m.length : 0));
    return html.replace(re, repl);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function setTitle(html, t) { return replaceRe(html, /<title>[\s\S]*?<\/title>/, '<title>' + esc(t) + '</title>', 'title'); }
  function setMeta(html, attr, key, val) {
    var re = new RegExp('(<meta ' + attr + '="' + key.replace(/[.:]/g, '\\$&') + '" content=")[^"]*(")');
    return replaceRe(html, re, '$1' + esc(val).replace(/\$/g, '$$$$') + '$2', attr + '=' + key);
  }
  function setLink(html, rel, href) {
    var re = new RegExp('(<link rel="' + rel + '" href=")[^"]*(")');
    return replaceRe(html, re, '$1' + href + '$2', 'link ' + rel);
  }
  /* The whole element (with nesting) that starts at index start. */
  function elementAt(html, start, tag) {
    var open = '<' + tag, close = '</' + tag + '>', depth = 0, i = start;
    while (i < html.length) {
      var o = html.indexOf(open, i), c = html.indexOf(close, i);
      if (c === -1) throw new Error('unclosed <' + tag + '> at ' + start);
      if (o !== -1 && o < c && /[\s>]/.test(html.charAt(o + open.length))) { depth++; i = o + open.length; }
      else { depth--; i = c + close.length; if (depth === 0) return html.slice(start, i); }
    }
    throw new Error('unclosed <' + tag + '>');
  }
  /* The <section> (or other tag) that contains a unique needle. */
  function enclosing(html, needle, tag, label) {
    var i = once(html, needle, label);
    var s = html.lastIndexOf('<' + tag, i);
    while (s !== -1) {
      var el = elementAt(html, s, tag);
      if (s + el.length > i) return { start: s, html: el };
      s = html.lastIndexOf('<' + tag, s - 1);
    }
    throw new Error(label + ': no enclosing <' + tag + '>');
  }
  function assets() {
    return {
      css: '  <link rel="stylesheet" href="/css/sw-division.css?v=' + VERSION + '">\n',
      js: '<script src="/js/vendor/gsap.min.js?v=' + VERSION + '" defer></script>\n' +
          '<script src="/js/vendor/ScrollTrigger.min.js?v=' + VERSION + '" defer></script>\n' +
          '<script src="/js/vendor/lenis.min.js?v=' + VERSION + '" defer></script>\n' +
          '<script src="/js/sw-division.js?v=' + VERSION + '" defer></script>\n'
    };
  }
  function addAssets(html, label) {
    if (html.indexOf('/js/sw-division.js') !== -1) return html;
    var a = assets();
    html = replaceOnce(html, '</head>', a.css + '</head>', label + ' </head>');
    html = replaceOnce(html, '</body>', a.js + '</body>', label + ' </body>');
    return html;
  }
  function ldScript(obj) { return '  <script type="application/ld+json">\n' + JSON.stringify(obj, null, 2).replace(/^/gm, '  ') + '\n  </script>\n'; }
  function stampMark(html) { return html.indexOf(MARK) !== -1 ? html : html.replace('</head>', '  ' + MARK + '\n</head>'); }

  var CRED_BADGE = '<span class="trust-badge sw-cred"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.2 7 22l5-3 5 3-1.2-8.8"/></svg> Owens Corning Preferred Contractor</span>';

  function citiesSection(exceptSlug, title) {
    var cards = CITIES.filter(function (c) { return c.slug !== exceptSlug; }).map(function (c) {
      return '        <a class="sw-city-card" href="/roofing-' + c.slug + '">Roofing in ' + esc(c.name) + ' <span>' + esc(c.county) + '</span></a>';
    }).join('\n');
    return '\n  <section class="section section-light" id="roofing-near-you">\n    <div class="container">\n' +
      '      <div class="section-header-center">\n        <span class="section-tag">Service Area</span>\n' +
      '        <h2 class="section-title">' + esc(title) + '</h2>\n' +
      '        <p class="section-subtitle">SW Roofing works across Knox, Blount, Anderson, Loudon and Sevier counties.</p>\n      </div>\n' +
      '      <div class="sw-cities">\n' + cards + '\n      </div>\n    </div>\n  </section>\n';
  }

  /* ---------- page transforms ---------- */
  function navAll(html, path) {
    if (html.indexOf(NAV_ROOFING) !== -1 || html.indexOf(NAV_SERVICES) === -1) return html;
    return replaceOnce(html, NAV_SERVICES, NAV_SERVICES + '\n        ' + NAV_ROOFING, path + ' nav');
  }

  function roofing(html) {
    if (html.indexOf(MARK) !== -1) return html;
    var t = 'Knoxville Roofing Contractor | SW Roofing by StructureWorks';
    var d = 'SW Roofing, the roofing division of StructureWorks: roof replacement, repair and storm damage across Knoxville and East TN. Free inspection: (865) 630-4073.';
    html = setTitle(html, t);
    html = setMeta(html, 'name', 'description', d);
    html = setMeta(html, 'property', 'og:title', t);
    html = setMeta(html, 'property', 'og:description', d);
    html = setMeta(html, 'name', 'twitter:title', t);
    html = setMeta(html, 'name', 'twitter:description', d);

    // Schema: the roofing business as a named division of StructureWorks.
    html = replaceRe(html, /<script type="application\/ld\+json">\s*(\{[\s\S]*?"@type"\s*:\s*"RoofingContractor"[\s\S]*?\})\s*<\/script>\n?/, function (all, json) {
      var o = JSON.parse(json);
      o.name = 'SW Roofing by StructureWorks';
      o.alternateName = ['SW Roofing', 'SW Roofing and Exteriors'];
      o.parentOrganization = { '@id': SITE + '/#organization' };
      o.description = 'SW Roofing is the roofing and exteriors division of StructureWorks, a licensed and insured contractor in Knoxville, TN. Roof replacement, repair and storm-damage restoration across East Tennessee.';
      o.sameAs = ['https://facebook.com/StructureWorksTN', 'https://instagram.com/structureworks_tn', 'https://linkedin.com/company/structureworks'];
      o.areaServed = CITIES.map(function (c) { return { '@type': 'City', name: c.name + ', TN' }; }).concat([{ '@type': 'City', name: 'Alcoa, TN' }, { '@type': 'City', name: 'Powell, TN' }, { '@type': 'City', name: 'Hardin Valley, TN' }]);
      return ldScript(o).replace(/^  /, '');
    }, 'roofing ld');

    html = replaceOnce(html, 'SW Roofing — Knoxville &amp; East Tennessee', 'SW Roofing by StructureWorks — Knoxville &amp; East TN', 'roofing eyebrow');
    html = replaceRe(html, /<div class="vendor-card"><img class="vendor-logo" src="\/img\/logo-gaf\.svg[^"]*"[^>]*><\/div>\s*/, '', 'roofing GAF logo');
    html = replaceOnce(html, '<div class="container trust-row">', '<div class="container trust-row">\n        ' + CRED_BADGE, 'roofing trust row');

    var faq = enclosing(html, 'Roofing Questions, Answered', 'section', 'roofing FAQ');
    html = html.slice(0, faq.start) + citiesSection(null, 'Roofing Near You').trim() + '\n\n  ' + html.slice(faq.start);

    html = addAssets(html, 'roofing');
    return stampMark(html);
  }

  function exteriors(html) {
    if (html.indexOf(MARK) !== -1) return html;
    var t = 'Decks & Outdoor Living in Knoxville, TN | StructureWorks';
    var d = 'Custom decks, outdoor kitchens, fencing, hardscape and turf in Knoxville and East TN from the SW Roofing & Exteriors team at StructureWorks. Free consultation.';
    html = setTitle(html, t);
    html = setMeta(html, 'name', 'description', d);
    html = setMeta(html, 'property', 'og:title', t);
    html = setMeta(html, 'property', 'og:description', d);
    html = setMeta(html, 'name', 'twitter:title', t);
    html = setMeta(html, 'name', 'twitter:description', d);
    html = addAssets(html, 'exteriors');
    return stampMark(html);
  }

  function cityPage(roofingPatched, c) {
    var url = SITE + '/roofing-' + c.slug;
    var t = 'Roofing Contractor in ' + c.name + ', TN | SW Roofing';
    var d = 'SW Roofing by StructureWorks replaces and repairs roofs in ' + c.name + ', TN: storm damage, leaks and full re-roofs. Free inspection, 24-hour response.';
    var html = roofingPatched;
    html = setTitle(html, t);
    html = setMeta(html, 'name', 'description', d);
    html = setMeta(html, 'property', 'og:title', t);
    html = setMeta(html, 'property', 'og:description', d);
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'name', 'twitter:title', t);
    html = setMeta(html, 'name', 'twitter:description', d);
    html = setLink(html, 'canonical', url);
    html = html.replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
    var ld = ldScript({ '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Roofing', name: 'Roofing in ' + c.name + ', TN',
        provider: { '@id': SITE + '/roofing' }, areaServed: { '@type': 'City', name: c.name, containedInPlace: { '@type': 'AdministrativeArea', name: c.county + ', Tennessee' } }, url: url }) +
      ldScript({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Roofing', item: SITE + '/roofing' },
        { '@type': 'ListItem', position: 3, name: c.name, item: url }] }) +
      ldScript({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map(function (q) {
        return { '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } }; }) });
    html = replaceOnce(html, '  ' + MARK + '\n</head>', ld + '  ' + MARK + '\n</head>', 'city head');

    var mainOpen = '<main id="main" tabindex="-1">';
    var a = once(html, mainOpen, 'city main open') + mainOpen.length;
    var b = once(html, '</main>', 'city main close');
    var main = html.slice(a, b);

    var heroStyle = (main.match(/<section class="hero hero-image-bg" (style="[^"]*")>/) || [])[1];
    if (!heroStyle) throw new Error('city: hero style not found');
    var trust = elementAt(main, once(main, '<div class="trust-strip">', 'city trust'), 'div');
    var services = enclosing(main, 'Complete Roofing for East Tennessee Homes', 'section', 'city services').html;
    var quote = enclosing(main, 'id="quote"', 'section', 'city quote').html;
    var cta = enclosing(main, 'class="section cta-section"', 'section', 'city cta').html;
    var fin = enclosing(main, 'id="financing-offer"', 'section', 'city financing').html;

    var hero = '\n  <section class="hero hero-image-bg" ' + heroStyle + '>\n    <div class="hero-overlay"></div>\n    <div class="hero-bg"></div>\n' +
      '    <div class="container hero-content">\n' +
      '      <nav class="sw-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/roofing">Roofing</a> / ' + esc(c.name) + '</nav>\n' +
      '      <span class="section-tag" style="color:#fff; background:rgba(255,255,255,0.15);">SW Roofing by StructureWorks — ' + esc(c.county) + '</span>\n' +
      '      <h1>Roofing in ' + esc(c.name) + ', TN<br><span class="accent">Replace, Repair, Restore</span></h1>\n' +
      '      <p class="hero-sub">' + esc(c.lede) + '</p>\n' +
      '      <div class="hero-buttons">\n        <a href="#quote" class="btn btn-primary btn-lg">Book a Free Inspection <span class="arrow">→</span></a>\n' +
      '        <a href="' + PHONE_TEL + '" class="btn btn-outline btn-lg">Call (865) 630-4073</a>\n      </div>\n    </div>\n  </section>\n\n  ';
    var intro = '\n\n  <section class="section">\n    <div class="container">\n      <div class="section-header-center">\n' +
      '        <span class="section-tag">' + esc(c.name) + ' Roofing</span>\n        <h2 class="section-title">A Local Roofer for ' + esc(c.name) + ' Homes</h2>\n      </div>\n' +
      '      <div class="sw-city-intro">\n' + c.intro.map(function (p) { return '        <p>' + esc(p) + '</p>'; }).join('\n') + '\n      </div>\n' +
      '      <div class="sw-city-points">\n' + c.points.map(function (p) {
        return '        <div class="feature-card"><h3>' + esc(p[0]) + '</h3><p>' + esc(p[1]) + '</p></div>'; }).join('\n') + '\n      </div>\n    </div>\n  </section>\n\n  ';
    var faq = '\n\n  <section class="section">\n    <div class="container">\n      <div class="section-header-center">\n        <span class="section-tag">FAQ</span>\n' +
      '        <h2 class="section-title">' + esc(c.name) + ' Roofing Questions</h2>\n      </div>\n      <div class="faq-list">\n' +
      c.faq.map(function (q) { return '        <details class="faq-item"><summary>' + esc(q[0]) + '</summary><div class="faq-a">' + esc(q[1]) + '</div></details>'; }).join('\n') +
      '\n      </div>\n    </div>\n  </section>\n';

    var newMain = hero + trust + intro + services + '\n\n  ' + quote + faq +
      citiesSection(c.slug, 'More Areas We Roof') + '\n  ' + cta + '\n\n  ' + fin + '\n';
    return html.slice(0, a) + newMain + html.slice(b);
  }

  function sitemap(xml) {
    if (xml.indexOf('/roofing-knoxville<') !== -1) return xml;
    ['/roofing', '/exteriors'].forEach(function (p) {
      var re = new RegExp('(<loc>' + SITE.replace(/[.\/]/g, '\\$&') + p.replace('/', '\\/') + '<\\/loc>\\s*<lastmod>)[^<]*(<\\/lastmod>)');
      if (re.test(xml)) xml = xml.replace(re, '$1' + TODAY + '$2');
    });
    var add = CITIES.map(function (c) {
      return '  <url>\n    <loc>' + SITE + '/roofing-' + c.slug + '</loc>\n    <lastmod>' + TODAY + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n';
    }).join('');
    return replaceOnce(xml, '</urlset>', add + '</urlset>', 'sitemap end');
  }

  /* files: { 'roofing.html': '...', 'exteriors.html': '...', 'sitemap.xml': '...', '<other>.html': '...' }
   * returns { out: { path: newContent } (changed or new files only), report: [lines] } */
  function applyAll(files) {
    var out = {}, report = [];
    Object.keys(files).forEach(function (p) {
      if (!/\.html$/.test(p)) return;
      var n = navAll(files[p], p);
      if (n !== files[p]) { out[p] = n; report.push('nav + Roofing: ' + p); }
    });
    function cur(p) { return out[p] !== undefined ? out[p] : files[p]; }
    if (!files['roofing.html']) throw new Error('roofing.html missing from snapshot');
    if (!files['exteriors.html']) throw new Error('exteriors.html missing from snapshot');
    var r = roofing(cur('roofing.html'));
    if (r !== cur('roofing.html')) { out['roofing.html'] = r; report.push('roofing.html: title, meta, schema, trust badge, GAF logo out, Roofing Near You, motion'); }
    var e = exteriors(cur('exteriors.html'));
    if (e !== cur('exteriors.html')) { out['exteriors.html'] = e; report.push('exteriors.html: title, meta, motion'); }
    CITIES.forEach(function (c) {
      out['roofing-' + c.slug + '.html'] = cityPage(r, c);
      report.push('new: roofing-' + c.slug + '.html');
    });
    if (files['sitemap.xml']) {
      var s = sitemap(files['sitemap.xml']);
      if (s !== files['sitemap.xml']) { out['sitemap.xml'] = s; report.push('sitemap.xml: +6 city URLs, lastmod roofing/exteriors'); }
    } else { throw new Error('sitemap.xml missing from snapshot'); }
    return { out: out, report: report };
  }

  root.SWDIV = { VERSION: VERSION, CITIES: CITIES, applyAll: applyAll };
})(typeof globalThis !== 'undefined' ? globalThis : this);
