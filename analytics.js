/* ===== StructureWorks analytics / ad pixels =====
 * Turnkey, privacy-aware tracking scaffold for Google, Meta, and TikTok campaigns.
 *
 * HOW TO ACTIVATE: paste your IDs below. Each platform stays completely inert
 * (no script loaded, no network request) until its ID is filled in, so this is
 * safe to ship before the ad accounts exist.
 *
 *   GA4_ID         — Google Analytics 4 Measurement ID  (looks like "G-XXXXXXXXXX")
 *   META_PIXEL_ID  — Meta/Facebook Pixel ID             (numeric, e.g. "1234567890")
 *   TIKTOK_PIXEL_ID— TikTok Pixel ID                    (e.g. "CXXXXXXXXXXXXXXXX")
 *
 * Conversion tracking: site.js calls window.swTrack('Lead', {...}) after a form
 * submits successfully, which forwards a conversion event to whichever pixels
 * are active. No PII is sent to the pixels — only the event + page.
 */
(function () {
  'use strict';

  var GA4_ID = '';
  var META_PIXEL_ID = '';
  var TIKTOK_PIXEL_ID = '';

  // ---- Google Analytics 4 / Google Ads ----
  if (GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  }

  // ---- Meta (Facebook/Instagram) Pixel ----
  if (META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // ---- TikTok Pixel ----
  if (TIKTOK_PIXEL_ID) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (e, n) { e[n] = function () { e.push([n].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (e) { for (var n = ttq._i[e] || [], i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(n, ttq.methods[i]); return n; };
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = r + '?sdkid=' + e + '&lib=' + t;
        var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(TIKTOK_PIXEL_ID); ttq.page();
    }(window, document, 'ttq');
  }

  /**
   * Fire a conversion across whichever pixels are active. Called by site.js on a
   * successful lead submit. `name` is a logical event ("Lead"); we map it to each
   * platform's standard conversion event. No personal data is forwarded.
   */
  window.swTrack = function (name, params) {
    params = params || {};
    try {
      if (window.gtag) window.gtag('event', name === 'Lead' ? 'generate_lead' : name, params);
      if (window.fbq) window.fbq('track', name === 'Lead' ? 'Lead' : name, params);
      if (window.ttq) window.ttq.track(name === 'Lead' ? 'SubmitForm' : name, params);
    } catch (e) { /* never let tracking break the page */ }
  };
})();
