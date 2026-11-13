/* Preview helper: run in a browser tab on https://structureworkstn.com/robots.txt
 *   (0,eval)(await fetch('<raw url of this file>').then(r => r.text()));
 *   await swPreview('<commit sha>', 'roofing.html', '/roofing');
 * Fetches the live pages, applies core.js from that commit, and renders the patched page
 * in place (assets from jsDelivr at that commit; analytics stripped so GA4 stays clean). */
async function swPreview(SHA, page, path) {
  var files = JSON.parse(sessionStorage.getItem('swin') || 'null');
  if (!files) {
    var sm = await fetch('/sitemap.xml', { cache: 'no-store' }).then(function (r) { return r.text(); });
    var urls = Array.from(sm.matchAll(/<loc>https:\/\/structureworkstn\.com([^<]*)<\/loc>/g)).map(function (m) { return m[1] || '/'; }).concat(['/thank-you', '/cost-calculator']);
    files = { 'sitemap.xml': sm, 'site.css': await fetch('/site.css', { cache: 'no-store' }).then(function (r) { return r.text(); }) };
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      files[(u === '/' ? 'index' : u.slice(1)) + '.html'] = await fetch(u, { cache: 'no-store' }).then(function (r) { return r.text(); });
    }
    sessionStorage.setItem('swin', JSON.stringify(files));
  }
  (0, eval)(await fetch('https://raw.githubusercontent.com/jstrange22-cell/structureworks-deploy/' + SHA + '/sw-division/core.js').then(function (r) { return r.text(); }));
  var res = SWDIV.applyAll(files);
  window.__res = res;
  window.__files = files;
  if (!page) return res.report.join('\n');
  var out = res.out;
  var cssUrl = URL.createObjectURL(new Blob([out['site.css']], { type: 'text/css' }));
  var cdn = 'https://cdn.jsdelivr.net/gh/jstrange22-cell/structureworks-deploy@' + SHA + '/sw-division/web';
  var h = (out[page] || files[page])
    .replace(/"site\.css\?v=\d+"/, '"' + cssUrl + '"')
    .replace(/"\/(css\/sw-division\.css|js\/sw-division\.js|js\/vendor\/[A-Za-z]+\.min\.js)\?v=\d+"/g, function (m, f) { return '"' + cdn + '/' + f + '"'; })
    .replace(/<script src="analytics\.js[^"]*" defer><\/script>/, '');
  history.replaceState(null, '', path);
  document.open(); document.write(h); document.close();
  return 'written';
}
