/* SW Roofing & Exteriors division layer: motion + lead tracking.
 * Loaded (defer) after site.js on /roofing, /exteriors and /roofing-<city> pages only.
 * Needs gsap.min.js, ScrollTrigger.min.js and lenis.min.js loaded before it.
 * Everything degrades: no GSAP or reduced motion means a static page that still tracks. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var canMove = !reduce && !!gsap && !!ST;
  var desktop = window.matchMedia('(min-width: 1025px)');

  /* ===== Tracking: click_call and estimate_click (standard event names) ===== */
  function track(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: 'sw_' + name }, params));
      if (typeof window.gtag === 'function') window.gtag('event', name, params);
    } catch (e) { /* tracking never breaks the page */ }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var where = a.closest('section, nav, footer, .sticky-call, #nav-links');
    var spot = where ? (where.id || where.className || where.tagName).toString().split(' ')[0] : 'page';
    if (href.indexOf('tel:') === 0) {
      track('click_call', { link_url: href, cta_location: spot, page_location: location.href });
    } else if (/quickroofbids\.com/i.test(href)) {
      track('estimate_click', { link_url: href, cta_location: spot, page_location: location.href });
    }
  }, true);

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    document.documentElement.classList.add('sw-div');

    /* site.js hides cards with inline styles for its own fade; this layer owns reveals here. */
    var old = document.getElementById('animate-style');
    if (old) old.remove();
    document.querySelectorAll('.feature-card, .step-card, .financing-card, .contact-item, .social-card, .stat-card, .team-card, .blog-card, .service-card, .testimonial-card, .value-block')
      .forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; el.style.transition = ''; el.style.transitionDelay = ''; });

    addRidges();
    upgradeMenu();
    liftChat();
    if (!canMove) return;

    gsap.registerPlugin(ST);
    smoothScroll();
    hero();
    reveals();
    processPin();
    transitions();
  });

  /* ===== Signature: ridge line under each section title ===== */
  function addRidges() {
    document.querySelectorAll('main .section-title, main .aeb-copy h2, main .contact-heading').forEach(function (h) {
      if (h.nextElementSibling && h.nextElementSibling.classList.contains('sw-ridge')) return;
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'sw-ridge');
      svg.setAttribute('viewBox', '0 0 92 18');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M2 16 L30 16 L46 3 L62 16 L90 16');
      svg.appendChild(p);
      h.insertAdjacentElement('afterend', svg);
    });
  }

  /* ===== Full-screen mobile menu with the two main actions ===== */
  function upgradeMenu() {
    var links = document.getElementById('nav-links');
    var toggle = document.getElementById('mobile-toggle');
    if (!links || !toggle) return;
    if (!links.querySelector('.sw-menu-cta')) {
      var call = document.createElement('li');
      call.className = 'sw-menu-cta';
      call.innerHTML = '<a class="sw-call" href="tel:8656304073">Call (865) 630-4073</a>';
      var quote = document.createElement('li');
      quote.className = 'sw-menu-cta';
      quote.innerHTML = '<a class="sw-quote" href="#quote">Free Roof Inspection</a>';
      if (!document.getElementById('quote')) quote.querySelector('a').setAttribute('href', '/contact');
      links.appendChild(call);
      links.appendChild(quote);
    }
    function sync() {
      var open = links.classList.contains('open');
      document.documentElement.classList.toggle('sw-menu-open', open);
      if (open && canMove) {
        gsap.fromTo(links.querySelectorAll('li'), { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05, overwrite: true });
      }
    }
    new MutationObserver(sync).observe(links, { attributes: true, attributeFilter: ['class'] });
  }

  /* ===== Keep the chat bubble clear of the sticky call bar on phones ===== */
  function liftChat() {
    var bar = document.querySelector('.sticky-call');
    function apply() {
      var btn = document.querySelector('[aria-label="Chat with StructureWorks"]');
      if (!btn || !bar) return false;
      var el = btn;
      while (el && el !== document.body && getComputedStyle(el).position !== 'fixed') el = el.parentElement;
      if (!el || el === document.body) return false;
      document.documentElement.style.setProperty('--sw-sticky-h', (bar.offsetHeight || 64) + 'px');
      el.classList.add('sw-lift-chat');
      return true;
    }
    if (!apply()) {
      var tries = 0;
      var t = setInterval(function () { if (apply() || ++tries > 20) clearInterval(t); }, 500);
    }
  }

  /* ===== Lenis smooth scroll, synced to ScrollTrigger ===== */
  function smoothScroll() {
    if (!window.Lenis || !desktop.matches) return;
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.swLenis = lenis;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      lenis.scrollTo(target, { offset: -80 });
      if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    }, true);
  }

  /* ===== Hero: staggered entrance, word spring, parallax background ===== */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'); w.className = 'sw-w';
          var i = document.createElement('span'); i.className = 'sw-wi'; i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        el.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        splitWords(n);
      }
    });
  }

  function hero() {
    var h = document.querySelector('.hero');
    if (!h) return;
    var h1 = h.querySelector('h1');
    var label = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
    if (h1) { h1.setAttribute('aria-label', label); splitWords(h1); }
    h.querySelectorAll('.sw-w').forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(h.querySelectorAll('.sw-crumbs, .section-tag'), { y: 18, opacity: 0, duration: 0.5 })
      .from(h.querySelectorAll('.sw-wi'), { yPercent: 110, rotateX: -45, opacity: 0, duration: 0.8, ease: 'back.out(1.5)', stagger: 0.05 }, '-=0.2')
      .from(h.querySelectorAll('.hero-sub'), { y: 22, opacity: 0, duration: 0.6 }, '-=0.45')
      .from(h.querySelectorAll('.hero-buttons > *'), { y: 18, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.35');

    if (!h.querySelector('.sw-scrollcue')) {
      var cue = document.createElement('div');
      cue.className = 'sw-scrollcue';
      cue.setAttribute('aria-hidden', 'true');
      h.appendChild(cue);
      tl.from(cue, { opacity: 0, y: -10, duration: 0.5 }, '-=0.2');
    }

    gsap.fromTo(h, { backgroundPosition: '50% 40%' }, {
      backgroundPosition: '50% 75%', ease: 'none',
      scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true }
    });
    var content = h.querySelector('.hero-content');
    if (content) {
      gsap.to(content, { yPercent: -18, opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ===== Scroll reveals: headers, grids (staggered), ridge draw ===== */
  function reveals() {
    var ease = 'power2.out';
    document.querySelectorAll('.trust-strip').forEach(function (s) {
      gsap.from(s.querySelectorAll('.trust-badge'), { y: 16, rotateX: -60, opacity: 0, duration: 0.6, ease: ease, stagger: 0.08, transformOrigin: '50% 0%',
        scrollTrigger: { trigger: s, start: 'top 92%', once: true } });
    });
    document.querySelectorAll('main .section-header-center, main .aeb-copy, main .contact-info, main .sw-city-intro, main .cta-content').forEach(function (el) {
      gsap.from(el, { y: 40, opacity: 0, duration: 0.6, ease: ease, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    var grids = ['.features-grid', '.vendor-strip', '.gallery-grid', '.financing-grid', '.faq-list', '.sw-cities', '.sw-city-points', '.rt-widget', '.contact-form-wrapper', '.aeb-cta', '.aeb-chips'];
    grids.forEach(function (sel) {
      document.querySelectorAll('main ' + sel).forEach(function (g) {
        var kids = g.children.length > 1 ? g.children : [g];
        gsap.from(kids, { y: 40, opacity: 0, duration: 0.6, ease: ease, stagger: 0.09,
          scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
      });
    });
    document.querySelectorAll('.sw-ridge path').forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 120;
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut',
        scrollTrigger: { trigger: p.closest('svg'), start: 'top 90%', once: true } });
    });
  }

  /* ===== "How it works": steps light up in order as you scroll ===== */
  function processPin() {
    var grid = document.querySelector('main .steps-grid');
    if (!grid) return;
    var section = grid.closest('section');
    var steps = grid.querySelectorAll('.step-card');
    if (!section || steps.length < 2) return;
    var track = document.createElement('div');
    track.className = 'sw-process-track';
    track.setAttribute('aria-hidden', 'true');
    track.innerHTML = '<div class="sw-process-fill"></div>';
    grid.parentNode.insertBefore(track, grid);
    var fill = track.firstChild;

    // Scroll-linked, not pinned: steps light up in order and the bar fills as the section
    // passes through the viewport. Pinning a short section left a blank screen below it.
    gsap.set(steps, { opacity: 0.2, y: 30 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 } });
    steps.forEach(function (s, i) {
      tl.to(s, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i * 0.8)
        .to(fill, { scaleX: (i + 1) / steps.length, duration: 1, ease: 'none' }, i * 0.8);
    });
  }

  /* ===== Route transitions: fade in on load, fade out on internal navigation ===== */
  function transitions() {
    var main = document.querySelector('main');
    if (main) gsap.from(main, { opacity: 0, y: 20, duration: 0.45, ease: 'power2.out', clearProps: 'all' });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      document.documentElement.classList.add('sw-leaving');
      setTimeout(function () { location.href = url.href; }, 230);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted) document.documentElement.classList.remove('sw-leaving'); });
  }
})();
