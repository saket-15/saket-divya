/* ==========================================================================
   script.js — builds the invitation from config.js. No need to edit.
   URL options:
     ?to=Sharma%20Family   personalise for a guest
     ?open=1               skip the envelope
   ========================================================================== */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  var isPreview = qs.has('preview');
  var skipEnvelope = qs.has('open');
  var guest = (qs.get('to') || qs.get('guest') || '').trim().slice(0, 80);

  var CFG = window.INVITATION || {};
  if (isPreview) {
    try { var d = localStorage.getItem('invitation-draft'); if (d) CFG = JSON.parse(d); } catch (e) { /* ignore */ }
  }

  var app = document.getElementById('app');
  var opened = false, timer = null, audio = null, petalsOn = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------------- helpers ---------------- */
  function get(path, dflt) {
    var v = path.split('.').reduce(function (o, k) { return o != null ? o[k] : undefined; }, CFG);
    return v == null || v === '' ? (dflt === undefined ? '' : dflt) : v;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function couple() { return get('couple.partner1', 'Partner') + ' & ' + get('couple.partner2', 'Partner'); }
  function tokens(s) {
    return String(s || '')
      .replace(/\{partner1\}/g, get('couple.partner1'))
      .replace(/\{partner2\}/g, get('couple.partner2'))
      .replace(/\{couple\}/g, couple())
      .replace(/\{guest\}/g, guest || 'Guest');
  }
  function txt(s) { return esc(tokens(s)).replace(/\\n|\n/g, '<br>'); }
  function safeUrl(u) { u = String(u || '').trim(); return /^(https?:|mailto:|tel:)/i.test(u) || /^[\w.\/-]+$/.test(u) ? u : ''; }
  function pad(n) { return String(n).padStart(2, '0'); }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function eventInfo() {
    var date = get('event.date', '2026-12-31'), time = get('event.time', '18:00'), endT = get('event.endTime', '');
    var off = get('event.utcOffset', '+00:00');
    if (!/^[+-]\d{2}:\d{2}$/.test(off)) off = '+00:00';
    var p = date.split('-').map(Number), t = time.split(':').map(Number);
    var Y = p[0], M = p[1], D = p[2], h = t[0] || 0, m = t[1] || 0;
    var start = new Date(date + 'T' + pad(h) + ':' + pad(m) + ':00' + off);
    if (isNaN(start)) start = new Date(Y, M - 1, D, h, m);
    var end = null;
    if (endT) {
      var e = endT.split(':').map(Number);
      end = new Date(start.getTime() + (((e[0] * 60 + (e[1] || 0)) - (h * 60 + m)) * 60000));
      if (end <= start) end = new Date(end.getTime() + 864e5);
    } else end = new Date(start.getTime() + 5 * 36e5);
    var wd = DAYS[new Date(Date.UTC(Y, M - 1, D)).getUTCDay()];
    var hh = h % 12 || 12, ap = h < 12 ? 'AM' : 'PM';
    return {
      start: start, end: end,
      short: pad(D) + '.' + pad(M) + '.' + String(Y).slice(-2),
      full: wd + ', ' + MONTHS[M - 1] + ' ' + D + ', ' + Y + ' at ' + hh + ':' + pad(m) + ' ' + ap
    };
  }

  function icsDate(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

  function monogram() {
    var mg = String(get('couple.monogram')).trim();
    if (/^[A-Za-z]{2}$/.test(mg)) return mg[0].toUpperCase() + '&' + mg[1].toUpperCase();   // "SD" -> "S&D"
    if (mg) return mg;
    return (get('couple.partner1', 'A').trim()[0] || 'A') + '&' + (get('couple.partner2', 'B').trim()[0] || 'B');
  }

  // Two initials ("SD", "S&D", "S & D") become an interlocking monogram; anything else is shown as typed.
  function monogramHTML() {
    var mg = monogram(), m = mg.match(/^\s*([A-Za-z])\s*&?\s*([A-Za-z])\s*$/);
    if (!m) return '<span class="mono">' + esc(mg) + '</span>';
    return '<span class="mono diag"><span class="l l1">' + m[1].toUpperCase() + '</span><span class="amp">&amp;</span>' +
      '<span class="l l2">' + m[2].toUpperCase() + '</span></span>';
  }

  function tornMask() {
    var d = 'M0 20L0 11', x = 0, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    while (x < 400) { x += 3 + rnd() * 9; d += 'L' + Math.min(x, 400).toFixed(1) + ' ' + (3 + rnd() * 10).toFixed(1); }
    d += 'L400 20Z';
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 20' preserveAspectRatio='none'><path d='" + d + "'/></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  function applyTheme() {
    var r = document.documentElement.style, th = CFG.theme || {};
    ['primary', 'accent', 'paper', 'envelope', 'seal'].forEach(function (k) {
      if (th[k]) r.setProperty('--' + k, th[k]); else r.removeProperty('--' + k);
    });
    r.setProperty('--torn', tornMask());
    document.title = tokens(get('pageTitle', '{couple} | Wedding Invitation'));
    var meta = document.querySelector('meta[name=theme-color]');
    if (meta && th.envelope) meta.content = th.envelope;
  }

  function titleRow(t) {
    return '<div class="title-row rv">' + ART.ornament(false) + '<h2 class="title">' + txt(t) + '</h2>' + ART.ornament(true) + '</div>';
  }
  var CHEVRON = '<svg viewBox="0 0 22 12" aria-hidden="true"><path d="M1 1l10 10L21 1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

  /* ---------------- templates ---------------- */
  // Gold line-art roses that twinkle on the flaps while the envelope opens: [left%, top%, size, rotate]
  var TWINKLES = [[11, 27, 1, -12], [24, 41, .8, 18], [8, 57, .9, -20], [21, 66, 1.1, 10], [5, 76, .7, 0],
    [89, 27, 1, 12], [76, 41, .8, -18], [92, 57, .9, 20], [79, 66, 1.1, -10], [95, 76, .7, 0],
    [36, 86, .8, -8], [62, 90, .9, 14], [50, 97, .6, 0]];

  function envelopeHTML() {
    var tw = TWINKLES.map(function (t, i) {
      return '<svg class="tw" viewBox="-20 -16 40 54" style="left:' + t[0] + '%;top:' + t[1] + '%;--s:' + t[2] + ';--r:' + t[3] + 'deg;--d:' + (1.1 + i * .09).toFixed(2) + 's"><use href="#rose-line"/></svg>';
    }).join('');
    return '<div class="envelope" id="envelope" role="button" aria-label="Open invitation" tabindex="0">' +
      '<div class="env-side"><div class="env-panel left">' + ART.envelopePanel() + '</div></div>' +
      '<div class="env-side"><div class="env-panel right">' + ART.envelopePanel() + '</div></div>' +
      '<div class="env-flap-wrap"><div class="env-flap"></div></div>' +
      '<svg class="env-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="0" x2="50" y2="46"/><line x1="100" y1="0" x2="50" y2="46"/>' +
      '<line x1="0" y1="100" x2="50" y2="46"/><line x1="100" y1="100" x2="50" y2="46"/></svg>' +
      '<div class="env-rays"></div>' +
      '<div class="env-door"></div>' +
      '<div class="env-twinkles" aria-hidden="true">' + tw + '</div>' +
      '<div class="env-warm"></div>' +
      (guest ? '<div class="env-guest"><small>' + txt(get('envelope.guestPrefix', 'Specially for')) + '</small><span>' + esc(guest) + '</span></div>' : '') +
      '<button class="seal" type="button" aria-label="Open invitation">' +
      ART.seal('color-mix(in srgb, var(--seal) 45%, #fff)', 'var(--seal)', 'color-mix(in srgb, var(--seal) 62%, #6b3c24)') +
      monogramHTML() + '</button>' +
      '<div class="env-hint">' + txt(get('envelope.tapHint', 'Tap to open')) + '</div>' +
      '</div>';
  }

  function heroHTML(ev) {
    var p1 = get('couple.partner1', 'Partner'), p2 = get('couple.partner2', 'Partner');
    var long = Math.max(p1.length, p2.length) > 9 ? ' long' : '';
    var img = safeUrl(get('hero.image'));
    return '<section class="hero" id="top">' +
      (img ? '<img class="hero-img" src="' + esc(img) + '" alt="">' : ART.heroScene()) +
      '<div class="hero-text">' +
      '<div class="hero-label">' + txt(get('hero.label', 'Wedding Day')) + '</div>' +
      '<div class="hero-date">' + esc(get('event.heroDateText', ev.short)) + '</div>' +
      '<h1 class="hero-names' + long + '">' + esc(p1) + '<span class="amp">&amp;</span>' + esc(p2) + '</h1>' +
      '</div>' +
      '<a class="scroll-hint" href="#invite">' + txt(get('hero.scrollHint', 'Scroll down')) + CHEVRON + '</a>' +
      '</section>';
  }

  function inviteHTML() {
    return '<section class="sec invite" id="invite">' + ART.garland() +
      (guest ? '<p class="greeting rv">' + txt(get('invitation.greeting', 'Dear {guest},')) + '</p>' : '') +
      '<h2 class="invite-heading rv">' + txt(get('invitation.heading', '{couple}\nwarmly invite you')) + '</h2>' +
      '<p class="lead rv">' + txt(get('invitation.message')) + '</p>' +
      '</section>';
  }

  function countdownHTML() {
    var u = function (id, l) { return '<div class="cd-unit"><span class="cd-num" id="cd-' + id + '">00</span><span class="cd-lbl">' + l + '</span></div>'; };
    var s = '<span class="cd-sep">:</span>';
    return '<section class="sec alt torn">' + titleRow(get('countdown.title', 'The Celebration Begins In')) +
      '<div class="cd rv" id="cd">' + u('d', 'Days') + s + u('h', 'Hours') + s + u('m', 'Minutes') + s + u('s', 'Seconds') + '</div>' +
      '<p class="cd-done rv" id="cd-done" hidden>' + txt(get('countdown.doneText', 'The celebration has begun!')) + '</p>' +
      '</section>';
  }

  // schedule.days = [{ date: "23 November", label: "", events: [{ time, title }] }]
  // (older configs with a flat schedule.items list still work)
  function scheduleDays() {
    var days = get('schedule.days', []);
    if (days.length) return days;
    var items = get('schedule.items', []);
    return items.length ? [{ date: '', events: items }] : [];
  }

  function scheduleHTML() {
    var days = scheduleDays();
    if (!days.length) return '';
    var body = days.map(function (d) {
      var head = d.date || d.label ? '<div class="tl-day">' +
        (d.label ? '<span class="tl-day-label">' + txt(d.label) + '</span>' : '') +
        (d.date ? '<span class="tl-day-date">' + txt(d.date) + '</span>' : '') + '</div>' : '';
      var rows = (d.events || []).map(function (it) {
        return '<div class="tl-row"><div class="tl-time">' + esc(it.time) + '</div><span class="tl-dot"></span><div class="tl-ev">' + txt(it.title) + '</div></div>';
      }).join('');
      return head + rows;
    }).join('');
    return '<section class="sec torn">' + titleRow(get('schedule.title', 'Schedule of Events')) +
      '<div class="tl" id="tl"><div class="tl-line"><div class="tl-fill"></div><div class="tl-rose">' + ART.roseIcon() + '</div></div>' + body + '</div>' +
      '</section>';
  }

  function locationHTML(ev) {
    var name = get('location.venueName'), addr = get('location.address');
    var q = get('location.mapQuery', [name, addr].filter(Boolean).join(', '));
    var link = safeUrl(get('location.mapLink')) || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q));
    var img = safeUrl(get('location.image'));
    var cal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(tokens('Wedding of {couple}')) +
      '&dates=' + icsDate(ev.start) + '/' + icsDate(ev.end) +
      '&location=' + encodeURIComponent([name, addr].filter(Boolean).join(', ')) +
      '&details=' + encodeURIComponent(tokens('We are delighted to celebrate with you!') + ' ' + location.href.split('?')[0]);
    var showMap = get('location.showMap', true) !== false && q;
    return '<section class="sec alt torn" id="location">' + titleRow(get('location.title', 'Location')) +
      (name ? '<div class="venue-name rv">' + esc(name) + '</div>' : '') +
      '<div class="venue-date rv">' + esc(get('event.fullDateText', ev.full)) + '</div>' +
      (addr ? '<p class="venue-addr rv">' + txt(addr) + '</p>' : '') +
      '<div class="venue-art rv">' + (img ? '<img src="' + esc(img) + '" alt="' + esc(name) + '" loading="lazy">' : ART.venue()) + '</div>' +
      (showMap ? '<div class="map-card rv"><iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' +
        encodeURIComponent(q) + '&z=15&output=embed"></iframe><a class="map-open" href="' + esc(link) + '" target="_blank" rel="noopener">Open in Maps &#8599;</a></div>' : '') +
      '<div class="btn-row rv">' +
      '<a class="btn" href="' + esc(link) + '" target="_blank" rel="noopener">' + txt(get('location.directionsButton', 'Get Directions')) + '</a>' +
      '<a class="btn ghost" href="' + esc(cal) + '" target="_blank" rel="noopener">' + txt(get('location.calendarButton', 'Add to Calendar')) + '</a>' +
      '</div></section>';
  }

  function dressHTML() {
    if (get('dressCode.show', true) === false) return '';
    var cols = get('dressCode.colors', []), img = safeUrl(get('dressCode.image'));
    return '<section class="sec torn">' + ART.sprig() + titleRow(get('dressCode.title', 'Dress Code')) +
      '<p class="lead rv">' + txt(get('dressCode.text')) + '</p>' +
      (cols.length ? '<div class="swatches rv">' + cols.map(function (c) {
        var hex = /^#[0-9a-f]{3,8}$/i.test(c.hex) ? c.hex : '#ccc';
        return '<div class="swatch"><i style="background:' + hex + '"></i><span>' + esc(c.name) + '</span></div>';
      }).join('') + '</div>' : '') +
      (img ? '<img class="dress-img rv" src="' + esc(img) + '" alt="Dress code inspiration" loading="lazy">' : '') +
      '</section>';
  }

  function rsvpHTML() {
    if (get('rsvp.show', true) === false) return '';
    return '<section class="sec alt torn" id="rsvp">' + titleRow(get('rsvp.title', 'Confirm Your Attendance')) +
      '<p class="lead rv">' + txt(get('rsvp.text')) + '</p>' +
      (get('rsvp.deadline') ? '<p class="deadline rv">' + txt(get('rsvp.deadline')) + '</p>' : '') +
      '<button class="rsvp-seal rv" type="button" id="rsvp-open" aria-haspopup="dialog">' +
      ART.seal('color-mix(in srgb, var(--primary) 60%, #fff)', 'var(--primary)', 'var(--primary-deep)') + '<span>RSVP</span></button>' +
      '<div class="rsvp-hint rv"><svg viewBox="0 0 22 12" aria-hidden="true"><path d="M1 11L11 1l10 10" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
      txt(get('rsvp.buttonHint', 'Click to open')) + '</div>' +
      '</section>';
  }

  function closingHTML() {
    return '<section class="sec closing torn">' +
      '<p class="closing-text rv">' + txt(get('closing.text', 'Hope to see you there!')) + '</p>' +
      '<p class="closing-sign rv">' + txt(get('closing.signature', '{couple}')) + '</p>' +
      ART.closingFlorals() + '</section>';
  }

  function modalHTML() {
    var max = Math.max(1, parseInt(get('rsvp.maxGuests', 10), 10) || 10);
    return '<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-h">' +
      '<div class="modal-card"><button class="modal-close" type="button" aria-label="Close" data-close>&times;</button>' +
      '<div id="rsvp-body"><h3 id="rsvp-h">' + txt(get('rsvp.title', 'Confirm Your Attendance')) + '</h3>' +
      '<form class="form" id="rsvp-form" novalidate>' +
      '<div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required value="' + esc(guest) + '"></div>' +
      '<div class="field"><fieldset><legend>Will you be attending?</legend>' +
      '<label class="choice"><input type="radio" name="attending" value="yes" required> ' + txt(get('rsvp.yesLabel', 'Joyfully accepts')) + '</label>' +
      '<label class="choice"><input type="radio" name="attending" value="no"> ' + txt(get('rsvp.noLabel', 'Regretfully declines')) + '</label>' +
      '</fieldset></div>' +
      '<div class="field" id="f-guests-wrap"><label for="f-guests">Number of guests attending</label><input id="f-guests" name="guests" type="number" min="1" max="' + max + '" value="1" inputmode="numeric"></div>' +
      '<div class="field"><label for="f-msg">A note for the couple <span class="muted">(optional)</span></label><textarea id="f-msg" name="message" rows="3"></textarea></div>' +
      '<p class="form-error" id="f-err" role="alert"></p>' +
      '<button class="btn" type="submit">Submit</button>' +
      '</form></div></div></div>';
  }

  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>';

  /* ---------------- render ---------------- */
  function render(cfg) {
    if (cfg) CFG = cfg;
    clearInterval(timer);
    applyTheme();
    var ev = eventInfo();
    var showEnv = !opened && !skipEnvelope;
    app.innerHTML = ART.defs + (showEnv ? envelopeHTML() : '') +
      '<main class="page">' + heroHTML(ev) + inviteHTML() + countdownHTML() + scheduleHTML() +
      locationHTML(ev) + dressHTML() + rsvpHTML() + closingHTML() + '</main>' +
      modalHTML() +
      '<button class="music" id="music" type="button" aria-label="Play or pause music">' + PLAY + '</button>';

    setupMusic();
    setupCountdown(ev);
    setupReveal();
    setupRSVP();
    onScroll();

    if (showEnv) {
      var env = document.getElementById('envelope');
      env.addEventListener('click', openEnvelope);
      env.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } });
    } else {
      revealPage();
    }
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;
    var env = document.getElementById('envelope');
    env.classList.add('opening');
    playMusic();
    // flap lifts -> light pours out under the seal -> rays + gold roses -> page fades in
    setTimeout(function () { env.classList.add('opened'); revealPage(); }, 3400);
    setTimeout(function () { if (env.parentNode) env.parentNode.removeChild(env); }, 5200);
  }

  function revealPage() {
    opened = true;
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { document.body.classList.add('revealed'); });
    startPetals();
    var mb = document.getElementById('music');
    if (mb && audio) mb.classList.add('on');
  }

  /* ---------------- music ---------------- */
  function setupMusic() {
    var src = safeUrl(get('music.src'));
    var btn = document.getElementById('music');
    if (!src) { if (audio) audio.pause(); audio = null; return; }
    if (!audio || audio.getAttribute('src') !== src) {
      if (audio) audio.pause();
      audio = new Audio(src); audio.loop = true; audio.preload = 'auto';
    }
    var sync = function () {
      var on = !audio.paused;
      btn.innerHTML = on ? PAUSE : PLAY;
      btn.classList.toggle('playing', on);
    };
    audio.onplay = sync; audio.onpause = sync; sync();
    btn.addEventListener('click', function () { audio.paused ? audio.play().catch(function () {}) : audio.pause(); });
    if (opened) btn.classList.add('on');
  }
  function playMusic() { if (audio) audio.play().catch(function () {}); }

  /* ---------------- countdown ---------------- */
  function setupCountdown(ev) {
    var el = { d: $('cd-d'), h: $('cd-h'), m: $('cd-m'), s: $('cd-s') };
    function tick() {
      var diff = ev.start - Date.now();
      if (diff <= 0) {
        $('cd').hidden = true; $('cd-done').hidden = false; $('cd-done').classList.add('in');
        clearInterval(timer); return;
      }
      var s = Math.floor(diff / 1000);
      el.d.textContent = pad(Math.floor(s / 86400));
      el.h.textContent = pad(Math.floor(s % 86400 / 3600));
      el.m.textContent = pad(Math.floor(s % 3600 / 60));
      el.s.textContent = pad(s % 60);
    }
    tick(); timer = setInterval(tick, 1000);
  }
  function $(id) { return document.getElementById(id); }

  /* ---------------- reveal + timeline ---------------- */
  var io = null;
  function setupReveal() {
    if (io) io.disconnect();
    var els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .15, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var tl = $('tl'); if (!tl) return;
      var line = tl.querySelector('.tl-line'), lr = line.getBoundingClientRect();
      var p = (innerHeight * .6 - lr.top) / lr.height;
      p = Math.max(0, Math.min(1, p));
      tl.querySelector('.tl-rose').style.top = (p * 100) + '%';
      tl.querySelector('.tl-fill').style.height = (p * 100) + '%';
      var y = lr.top + p * lr.height;
      tl.querySelectorAll('.tl-row, .tl-day').forEach(function (r) {
        var rr = r.getBoundingClientRect();
        r.classList.toggle('past', rr.top + rr.height / 2 <= y + 4);
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------------- petals ---------------- */
  function startPetals() {
    if (petalsOn || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    petalsOn = true;
    var box = document.createElement('div'); box.className = 'petals'; box.setAttribute('aria-hidden', 'true');
    var colors = ['#c9707c', '#e8b4b0', '#8a2433', '#f2d3c9', '#d9b48a'];
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span'); p.className = 'petal';
      var c = colors[i % colors.length], sz = 9 + Math.random() * 8;
      p.style.cssText = 'left:' + (Math.random() * 96) + '%;width:' + sz + 'px;height:' + (sz * .82) + 'px;' +
        'background:linear-gradient(135deg,' + c + ',' + c + 'aa);animation-duration:' + (11 + Math.random() * 10) + 's;' +
        'animation-delay:' + (-Math.random() * 18) + 's;opacity:' + (.5 + Math.random() * .4);
      box.appendChild(p);
    }
    document.body.appendChild(box);
  }

  /* ---------------- RSVP ---------------- */
  function setupRSVP() {
    var modal = $('modal'), openBtn = $('rsvp-open');
    if (!modal) return;
    var lastFocus = null;
    function open() { lastFocus = document.activeElement; modal.classList.add('show'); setTimeout(function () { var f = $('f-name'); if (f) f.focus(); }, 300); }
    function close() { modal.classList.remove('show'); if (lastFocus) lastFocus.focus(); }
    if (openBtn) openBtn.addEventListener('click', open);
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.hasAttribute('data-close')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('show')) close(); });

    var form = $('rsvp-form');
    form.addEventListener('change', function () {
      var no = form.attending.value === 'no';
      $('f-guests-wrap').style.display = no ? 'none' : '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('f-err'), name = form.name.value.trim(), att = form.attending.value;
      var max = parseInt(form.guests.max, 10), n = parseInt(form.guests.value, 10) || 1;
      if (!name) { err.textContent = 'Please enter your name.'; form.name.focus(); return; }
      if (!att) { err.textContent = 'Please let us know if you can attend.'; return; }
      var yes = att === 'yes';
      if (yes && (n < 1 || n > max)) { err.textContent = 'Please enter between 1 and ' + max + ' guests.'; return; }
      err.textContent = '';
      var data = {
        name: name, attending: yes ? 'Yes' : 'No', guests: yes ? n : 0,
        message: form.message.value.trim(), invitedAs: guest, submittedAt: new Date().toISOString()
      };
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      sendRSVP(data).then(function () { thanks(yes); }, function () {
        btn.disabled = false; btn.textContent = 'Submit';
        err.textContent = 'Sorry, something went wrong. Please try again.';
      });
    });
  }

  function sendRSVP(d) {
    var r = CFG.rsvp || {}, method = String(r.method || 'whatsapp').toLowerCase();
    var summary = tokens('RSVP for the wedding of {couple}') + '\n\nName: ' + d.name + '\nAttending: ' + d.attending +
      (d.attending === 'Yes' ? '\nGuests: ' + d.guests : '') + (d.message ? '\nMessage: ' + d.message : '');
    var phone = String(r.whatsappNumber || '').replace(/\D/g, '');

    if (isPreview) return Promise.resolve();
    if (method === 'google-sheet' && r.googleScriptUrl) {
      return fetch(r.googleScriptUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) });
    }
    if (method === 'formspree' && r.formspreeId) {
      return fetch('https://formspree.io/f/' + encodeURIComponent(r.formspreeId), {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d)
      }).then(function (res) { if (!res.ok) throw new Error('Formspree error'); });
    }
    if (method === 'email' && r.email) {
      location.href = 'mailto:' + encodeURIComponent(r.email) + '?subject=' + encodeURIComponent(tokens('RSVP: {couple}')) + '&body=' + encodeURIComponent(summary);
      return Promise.resolve();
    }
    if (phone) { window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(summary), '_blank'); return Promise.resolve(); }
    if (r.email) { location.href = 'mailto:' + encodeURIComponent(r.email) + '?subject=' + encodeURIComponent('RSVP') + '&body=' + encodeURIComponent(summary); return Promise.resolve(); }
    console.warn('RSVP: no destination configured in config.js → rsvp. Response:', d);
    return Promise.resolve();
  }

  function thanks(yes) {
    $('rsvp-body').innerHTML = '<div class="thanks"><h3>' + (yes ? 'Thank You' : 'Thank You') + '</h3><p>' +
      txt(yes ? get('rsvp.thankYouYes', 'We can\'t wait to celebrate with you!') : get('rsvp.thankYouNo', 'You will be missed!')) +
      '</p><button class="btn" type="button" data-close>Close</button></div>';
  }

  /* ---------------- live preview from customize.html ---------------- */
  if (isPreview) {
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'invitation-config' && e.data.config) {
        var y = window.scrollY;
        render(e.data.config);
        window.scrollTo(0, y);
      }
      if (e.data && e.data.type === 'invitation-replay') { location.reload(); }
    });
  }

  render();
})();
