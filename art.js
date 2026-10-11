/* ==========================================================================
   art.js — hand-drawn SVG illustrations (roses, swans, arch, venue, seals)
   You normally do NOT need to edit this file. All text/colours live in config.js
   ========================================================================== */
(function () {
  'use strict';

  var P = {
    burgundy: 'var(--primary)',
    wine: '#5a1522',
    pink: '#d3909a',
    blush: '#f1cbc2',
    cream: '#f6e5d0',
    leaf: '#808c5f',
    leafDk: '#5e6a45',
    gold: 'var(--accent)'
  };

  function petal(len, w) {
    return 'M0 0C' + -w + ' ' + -len * 0.2 + ' ' + -w + ' ' + -len * 0.95 + ' 0 ' + -len +
      'C' + w + ' ' + -len * 0.95 + ' ' + w + ' ' + -len * 0.2 + ' 0 0Z';
  }
  function ring(n, len, w, off) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<path transform="rotate(' + (off + i * 360 / n) + ')" d="' + petal(len, w) + '"/>';
    return s;
  }

  var SWAN =
    '<path d="M6 60C14 66 28 62 38 64C46 65 50 60 51 52C52 40 42 26 50 14C56 4 74 3 82 13L97 29L85 25C78 18 66 14 62 21C58 28 64 40 66 50C68 60 74 68 68 76C58 86 28 86 14 78C8 74 4 66 6 60Z" fill="#fbf8f3" stroke="#cbbfb1" stroke-width="1"/>' +
    '<path d="M18 67C30 51 50 53 60 65C52 75 32 79 18 67Z" fill="#eee5da" stroke="#cdbfae" stroke-width=".8"/>' +
    '<path d="M26 66C34 60 44 60 52 66M30 71C38 66 46 66 54 70" fill="none" stroke="#cdbfae" stroke-width=".7"/>' +
    '<path d="M83 15L97 29L86 26Z" fill="#d9823b"/>' +
    '<path d="M79 12C83 11 86 14 85 18L81 16Z" fill="#2b2b2b"/>' +
    '<circle cx="78" cy="15" r="1.3" fill="#2b2b2b"/>';

  var DEFS =
    '<svg class="art-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    '<defs>' +
    '<radialGradient id="rose-core"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".7" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient>' +
    '<g id="rose">' +
    '<g fill="currentColor" stroke="#000" stroke-opacity=".2" stroke-width="1.2">' + ring(6, 47, 30, 0) + '</g>' +
    '<circle r="30" fill="#000" opacity=".13"/>' +
    '<g fill="currentColor" stroke="#000" stroke-opacity=".24" stroke-width="1.2">' + ring(5, 34, 22, 36) + '</g>' +
    '<circle r="18" fill="currentColor" stroke="#000" stroke-opacity=".25" stroke-width="1.2"/>' +
    '<circle r="18" fill="url(#rose-core)"/>' +
    '<path d="M-11 4C-12-9 9-12 11 0C11 10-6 11-6 1C-6-5 3-6 3 0" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M-30-20C-18-36 18-38 30-18" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>' +
    '</g>' +
    '<g id="leaf"><path d="M0 0C10-12 30-13 44 0C30 13 10 12 0 0Z" fill="currentColor"/><path d="M3 0H40" stroke="#000" stroke-opacity=".2" stroke-width="1.2"/></g>' +
    '<g id="bud"><path d="M0 0C-9-6-8-20 0-26C8-20 9-6 0 0Z" fill="currentColor"/><path d="M0 2C-8-2-10-10-7-14C-4-8-2-5 0-4C2-5 4-8 7-14C10-10 8-2 0 2Z" fill="' + P.leafDk + '"/></g>' +
    '<g id="swan">' + SWAN + '</g>' +
    '<filter id="emboss" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="-.8" dy="-.8" stdDeviation=".3" flood-color="#ffd9c8" flood-opacity=".13"/><feDropShadow dx="1.3" dy="1.5" stdDeviation=".7" flood-color="#000" flood-opacity=".75"/></filter>' +
    '<filter id="copper" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="-.7" dy="-.7" stdDeviation=".3" flood-color="#ffe2b8" flood-opacity=".7"/><feDropShadow dx="1.2" dy="1.4" stdDeviation=".6" flood-color="#2a0e05" flood-opacity=".85"/></filter>' +
    '<g id="rose-line" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M1-3C4-5 6-1 3 1C0 4-5 2-5-2C-5-7 1-10 6-7"/><path d="M-12-4C-14 6-6 13 2 12C10 11 14 4 12-5"/>' +
    '<path d="M-12-4C-10-12-2-15 6-12M12-5C11-10 8-13 5-13"/><path d="M1 12C1 20-1 28-4 36"/>' +
    '<path d="M-1 24C-9 19-15 21-18 27C-12 29-6 28-1 24Z"/><path d="M-2 31C5 26 11 27 13 31C7 35 2 34-2 31Z"/></g>' +
    '<filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>' +
    '</defs></svg>';

  function rose(x, y, r, c, rot) {
    return '<use href="#rose" style="color:' + c + '" transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + (r / 47).toFixed(3) + ')"/>';
  }
  function leaf(x, y, a, s, c) {
    return '<use href="#leaf" style="color:' + (c || P.leaf) + '" transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (s || 1) + ')"/>';
  }
  function bud(x, y, a, s, c) {
    return '<use href="#bud" style="color:' + (c || P.pink) + '" transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + (s || 1) + ')"/>';
  }
  function dots(list) {
    return list.map(function (d) {
      return '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + (d[2] || 2.4) + '" fill="#fffaf2" stroke="#d8cbbb" stroke-width=".5"/>';
    }).join('');
  }

  /* A lush floral corner. Origin = the corner; it grows up (-y) and right (+x). */
  function cornerCluster() {
    return [
      leaf(8, -150, -82, 1.3), leaf(38, -178, -62, 1.1, P.leafDk), leaf(150, -92, -22, 1.2),
      leaf(178, -42, 8, 1.3, P.leafDk), leaf(118, -142, -48, 1.05), leaf(205, -12, -4, 1.1),
      leaf(-6, -60, -100, 1.1, P.leafDk), leaf(92, -200, -70, .9),
      bud(98, -196, -12, 1, P.burgundy), bud(214, -70, 42, .9, P.pink), bud(46, -212, -30, .8, P.blush),
      rose(30, -96, 40, P.blush, 10), rose(122, -56, 44, P.burgundy, -15), rose(58, -30, 46, P.pink, 30),
      rose(170, -14, 30, P.cream, 5), rose(78, -146, 28, P.burgundy, 40), rose(8, -22, 30, P.wine, 0),
      rose(150, -110, 20, P.pink, 12),
      dots([[100, -100], [106, -92, 2], [190, -60], [196, -52, 2], [40, -170], [140, -150, 2], [210, -36, 2], [16, -128]])
    ].join('');
  }

  function swanPair(cx, waterY, s) {
    // beak tip of the right-facing swan is at x=96, waterline ~y=80
    var tx = (96 * s).toFixed(1), y = (waterY - 80 * s).toFixed(1);
    var pair =
      '<use href="#swan" transform="translate(' + (cx - tx) + ' ' + y + ') scale(' + s + ')"/>' +
      '<use href="#swan" transform="translate(' + (cx + +tx) + ' ' + y + ') scale(' + -s + ' ' + s + ')"/>';
    return '<g opacity=".28" transform="translate(0 ' + 2 * waterY + ') scale(1 -1)">' + pair + '</g>' + pair;
  }

  /* ---------- HERO: garden arch, lake, swans, roses ---------- */
  function heroScene() {
    var vines = '';
    for (var i = 0; i <= 16; i++) {
      var a = Math.PI - (i / 16) * Math.PI;
      var x = 200 + 140 * Math.cos(a), y = 282 - 140 * Math.sin(a);
      var deg = (-a * 180 / Math.PI) + (i % 2 ? 70 : -110);
      vines += leaf(x.toFixed(1), y.toFixed(1), deg.toFixed(0), .45, i % 3 ? P.leaf : P.leafDk);
      if (i % 4 === 2) vines += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.2" fill="' + P.blush + '"/>';
    }
    var shimmer = '';
    [[90, 600, 40], [250, 612, 60], [150, 700, 70], [300, 690, 40], [60, 760, 50], [240, 772, 80]].forEach(function (l) {
      shimmer += '<path d="M' + l[0] + ' ' + l[1] + 'h' + l[2] + '" />';
    });
    return '<svg class="scene" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8ecdf"/><stop offset=".55" stop-color="#f4ddc7"/><stop offset="1" stop-color="#ead0b8"/></linearGradient>' +
      '<radialGradient id="h-glow"><stop offset="0" stop-color="#fff7e8" stop-opacity=".95"/><stop offset="1" stop-color="#fff7e8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="h-lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecdccb"/><stop offset="1" stop-color="#cdb8a3"/></linearGradient>' +
      '<linearGradient id="h-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d6c1a7"/><stop offset=".07" stop-color="#f0e3d2"/><stop offset=".16" stop-color="#d9c5ab"/><stop offset=".84" stop-color="#d9c5ab"/><stop offset=".93" stop-color="#f0e3d2"/><stop offset="1" stop-color="#d6c1a7"/></linearGradient>' +
      '</defs>' +
      '<rect width="400" height="800" fill="url(#h-sky)"/>' +
      '<ellipse cx="200" cy="480" rx="200" ry="170" fill="url(#h-glow)"/>' +
      '<g filter="url(#soft-blur)" opacity=".55">' +
      '<ellipse cx="80" cy="525" rx="70" ry="65" fill="#a5a67e"/><ellipse cx="150" cy="552" rx="60" ry="30" fill="#bab590"/>' +
      '<ellipse cx="270" cy="548" rx="70" ry="38" fill="#b1ae87"/><ellipse cx="335" cy="515" rx="60" ry="75" fill="#9ea078"/>' +
      '</g>' +
      '<rect y="565" width="400" height="235" fill="url(#h-lake)"/>' +
      '<g filter="url(#soft-blur)" opacity=".25"><ellipse cx="80" cy="600" rx="70" ry="30" fill="#a5a67e"/><ellipse cx="335" cy="605" rx="60" ry="35" fill="#9ea078"/></g>' +
      '<g stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round">' + shimmer + '</g>' +
      swanPair(200, 684, .95) +
      '<path fill="url(#h-stone)" fill-rule="evenodd" d="M-40 -40H440V840H-40Z M60 840V282A140 140 0 0 1 340 282V840Z"/>' +
      '<path d="M60 840V282A140 140 0 0 1 340 282V840" fill="none" stroke="#bfa88b" stroke-width="3"/>' +
      '<path d="M72 840V284A128 128 0 0 1 328 284V840" fill="none" stroke="#f6ecdf" stroke-width="2"/>' +
      '<path d="M44 840V300M18 840V300M356 840V300M382 840V300" stroke="#c9b397" stroke-width="1.4"/>' +
      '<path d="M4 286H74V300H4ZM326 286H396V300H326Z" fill="#e8d9c5" stroke="#bfa88b"/>' +
      '<path d="M186 128H214L210 150H190Z" fill="#e8d9c5" stroke="#bfa88b"/>' +
      '<g fill="none" stroke="#cdb89c" stroke-width="1.2" opacity=".8">' +
      '<circle cx="34" cy="120" r="16"/><circle cx="34" cy="120" r="7"/><circle cx="366" cy="120" r="16"/><circle cx="366" cy="120" r="7"/>' +
      '<path d="M8 210C30 190 50 220 70 196M392 210C370 190 350 220 330 196"/></g>' +
      vines +
      '<g transform="translate(60 214) scale(.42)">' + rose(0, 0, 40, P.burgundy) + rose(44, 30, 30, P.pink) + rose(-30, 40, 26, P.blush) + leaf(30, -30, -40, 1.1) + '</g>' +
      '<g transform="translate(340 214) scale(-.42 .42)">' + rose(0, 0, 40, P.pink) + rose(44, 30, 30, P.burgundy) + rose(-30, 40, 26, P.cream) + leaf(30, -30, -40, 1.1) + '</g>' +
      '<g transform="translate(-6 806) scale(.7)">' + cornerCluster() + '</g>' +
      '<g transform="translate(406 806) scale(-.7 .7)">' + cornerCluster() + '</g>' +
      '</svg>';
  }

  /* ---------- garland for the top of the invitation section ---------- */
  function garland() {
    return '<svg class="garland" viewBox="0 0 400 170" aria-hidden="true">' +
      '<defs><radialGradient id="g-lake"><stop offset="0" stop-color="#e3cfbd"/><stop offset="1" stop-color="#e3cfbd" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="200" cy="120" rx="120" ry="38" fill="url(#g-lake)"/>' +
      swanPair(200, 104, .58) +
      '<g transform="translate(-4 -6) scale(.6 -.6)">' + cornerCluster() + '</g>' +
      '<g transform="translate(404 -6) scale(-.6 -.6)">' + cornerCluster() + '</g>' +
      '</svg>';
  }

  /* ---------- florals for the closing section ---------- */
  function closingFlorals() {
    return '<svg class="closing-florals" viewBox="0 50 400 186" aria-hidden="true">' +
      '<g transform="translate(-4 236) scale(.8)">' + cornerCluster() + '</g>' +
      '<g transform="translate(404 236) scale(-.8 .8)">' + cornerCluster() + '</g>' +
      '</svg>';
  }

  /* ---------- small corner sprig (dress code) ---------- */
  function sprig() {
    return '<svg class="sprig" viewBox="0 0 160 160" aria-hidden="true"><g transform="translate(160 0) scale(-.62 .62) rotate(90)">' + cornerCluster() + '</g></svg>';
  }

  /* ---------- venue sketch (used when no venue photo is given) ---------- */
  function venue() {
    var up = '', low = '';
    for (var i = 0; i < 8; i++) {
      var x = 62 + i * 25;
      up += '<path d="M' + x + ' 98V86A6 6 0 0 1 ' + (x + 12) + ' 86V98Z"/>';
      if (i !== 3 && i !== 4) low += '<path d="M' + x + ' 150V126A8 8 0 0 1 ' + (x + 14) + ' 126V150Z"/>';
    }
    return '<svg class="venue-svg" viewBox="0 0 320 180" aria-hidden="true">' +
      '<ellipse cx="160" cy="160" rx="158" ry="16" fill="#d9c3a0" opacity=".55"/>' +
      '<path d="M18 160C8 140 14 112 32 106C50 100 62 120 56 140C54 152 46 160 18 160Z" fill="#8f8b5c" opacity=".9"/>' +
      '<rect x="50" y="70" width="210" height="90" fill="#ecd9b8" stroke="#8a6a48" stroke-width="1.2"/>' +
      '<path d="M42 72L66 52H244L268 72Z" fill="#b98263" stroke="#7c5038" stroke-width="1.2"/>' +
      '<path d="M50 108H260" stroke="#8a6a48" stroke-width=".8"/>' +
      '<g fill="#6e4f38" opacity=".85">' + up + low + '</g>' +
      '<path d="M140 150V122A15 15 0 0 1 170 122V150Z" fill="#5b3d2a"/>' +
            '<g stroke="#8a6a48" stroke-width=".5" opacity=".5">' +
      '<path d="M54 76l10 10M54 90l10 10M240 76l10 10M240 90l10 10M54 114l8 8M246 114l8 8"/></g>' +
      '<path d="M262 160C250 120 255 62 266 28C277 62 282 120 270 160Z" fill="#76744d"/>' +
      '<path d="M286 160C278 128 281 84 290 56C298 84 300 128 294 160Z" fill="#666a44"/>' +
      '<g fill="#8b915f"><ellipse cx="78" cy="160" rx="22" ry="8"/><ellipse cx="226" cy="160" rx="24" ry="8"/><ellipse cx="155" cy="162" rx="30" ry="6"/></g>' +
      '</svg>';
  }

  /* ---------- envelope side-flap florals (embossed peonies, like the reference) ----------
     Drawn for the LEFT flap in a 200 x 800 box; the right flap is a mirror image. */
  function panelFlorals() {
    var c = 'currentColor', s = '';
    [[12, 120, -62, .9], [66, 214, -28, 1], [128, 300, -18, 1], [150, 404, 18, 1.05], [112, 498, 38, 1], [18, 470, -118, 1],
      [92, 566, 30, .9], [36, 690, 64, .85], [96, 334, -6, .8], [4, 252, -100, .9], [58, 744, 72, .7], [150, 352, -40, .7],
      [44, 404, 150, .9], [20, 612, -70, .8]].forEach(function (l) { s += leaf(l[0], l[1], l[2], l[3], c); });
    [[40, 152, 28, 10], [86, 262, 40, -14], [34, 344, 32, 20], [128, 372, 34, 4], [72, 452, 44, 30], [30, 560, 34, -8], [62, 640, 22, 16]]
      .forEach(function (r) { s += rose(r[0], r[1], r[2], c, r[3]); });
    [[110, 190], [116, 198], [14, 410], [8, 402], [140, 450], [100, 610], [106, 618], [22, 214]].forEach(function (d) {
      s += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="3.2" fill="currentColor"/>';
    });
    return s;
  }
  function envelopePanel() {
    var art = panelFlorals();
    return '<svg class="env-emb" viewBox="0 0 200 800" preserveAspectRatio="xMinYMid meet" aria-hidden="true"><g filter="url(#emboss)" style="color:#3c1b1d">' + art + '</g></svg>' +
      '<div class="env-copper"><svg viewBox="0 0 200 800" preserveAspectRatio="xMinYMid meet" aria-hidden="true"><g filter="url(#copper)" style="color:#9c5b33">' + art + '</g></svg></div>';
  }

  /* ---------- wax seal: puffy rim, recessed disc, engraved ring ---------- */
  var sealCount = 0;
  function seal(light, mid, dark) {
    var id = 'seal' + (++sealCount), pts = [];
    for (var i = 0; i < 120; i++) {
      var a = i / 120 * Math.PI * 2;
      var r = 45.6 + 2.6 * Math.sin(a * 8 + .5) + 1 * Math.sin(a * 13 + 1) + .7 * Math.sin(a * 3 + 2);
      pts.push((50 + r * Math.cos(a)).toFixed(2) + ',' + (50 + r * Math.sin(a)).toFixed(2));
    }
    var st = function (c, o) { return 'style="stop-color:' + c + (o != null ? ';stop-opacity:' + o : '') + '"'; };
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs>' +
      '<radialGradient id="' + id + 'g" cx=".34" cy=".28" r=".85"><stop offset="0" ' + st(light) + '/><stop offset=".55" ' + st(mid) + '/><stop offset="1" ' + st(dark) + '/></radialGradient>' +
      '<radialGradient id="' + id + 'd" cx=".6" cy=".64" r=".62"><stop offset="0" ' + st(mid) + '/><stop offset=".78" ' + st(mid) + '/><stop offset="1" ' + st(dark) + '/></radialGradient>' +
      '<filter id="' + id + 'b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>' +
      '</defs>' +
      '<polygon points="' + pts.join(' ') + '" style="fill:url(#' + id + 'g)"/>' +
      '<polygon points="' + pts.join(' ') + '" fill="none" style="stroke:' + light + '" stroke-opacity=".7" stroke-width=".8" transform="translate(-.5 -.5)"/>' +
      '<circle cx="51.2" cy="51.6" r="35.5" style="fill:' + dark + '" opacity=".45" filter="url(#' + id + 'b)"/>' +
      '<circle cx="50" cy="50" r="33.5" style="fill:url(#' + id + 'd)"/>' +
      '<circle cx="50.7" cy="50.8" r="33.5" fill="none" style="stroke:' + light + '" stroke-opacity=".9" stroke-width="1.1"/>' +
      '<circle cx="49.6" cy="49.5" r="33.5" fill="none" style="stroke:' + dark + '" stroke-opacity=".5" stroke-width="1"/>' +
      '<circle cx="50.5" cy="50.5" r="29.2" fill="none" style="stroke:' + light + '" stroke-opacity=".7" stroke-width=".7"/>' +
      '<circle cx="50" cy="50" r="29.2" fill="none" style="stroke:' + dark + '" stroke-opacity=".55" stroke-width=".7"/>' +
      '<path d="M14 40C18 24 30 13 44 10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round" filter="url(#' + id + 'b)"/>' +
      '</svg>';
  }

  function ornament(flip) {
    return '<svg class="orn" viewBox="0 0 60 16" aria-hidden="true"' + (flip ? ' style="transform:scaleX(-1)"' : '') + '>' +
      '<path d="M58 8H22C16 8 12 3 7 4C2 5 2 12 7 12C11 12 11 7 8 7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M30 8C34 3 40 3 44 8C40 13 34 13 30 8Z" fill="currentColor" opacity=".5"/></svg>';
  }

  function roseIcon() {
    return '<svg viewBox="-50 -50 100 100" aria-hidden="true">' + rose(0, 0, 47, P.burgundy) + '</svg>';
  }

  window.ART = {
    defs: DEFS, heroScene: heroScene, garland: garland, closingFlorals: closingFlorals, sprig: sprig,
    venue: venue, envelopePanel: envelopePanel, seal: seal, ornament: ornament, roseIcon: roseIcon
  };
})();
