/* ===== Graphics helpers ===== */
const $ = (id) => document.getElementById(id);
const W = 384, H = 216, TAU = Math.PI * 2;
const S = 4; // canvas is drawn at 4x for smooth, high-resolution output
const K = {
  ink: '#fff4d6', dark: '#0d0620', red: '#e63946', redD: '#a1202f', yellow: '#ffd23f', orange: '#ff8c1a',
  blue: '#3a86ff', blueD: '#2455b8', green: '#3ddc84', greenD: '#1f9e5a', purple: '#8338ec', purpleD: '#5a22a8',
  pink: '#ff6fb5', white: '#ffffff', skin: '#ffd7b0', skinD: '#d9a577', brown: '#8a5a33', brownD: '#5e3b1e',
  steel: '#9aa5c4', steelD: '#5d6788', sky1: '#5fb8ff', sky2: '#8fd0ff', sky3: '#bfe8ff',
  grass: '#4cb35a', grassD: '#3a9a49', path: '#e8c999', pathD: '#cfa874', hill: '#6fcf8a', hill2: '#58b873',
};
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const STARS = (() => {
  let s = 7; const out = [];
  for (let i = 0; i < 60; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const x = s % W; s = (s * 1103515245 + 12345) & 0x7fffffff; out.push([x, s % 96]); }
  return out;
})();

const _sc = {};
/* lighten (f>0) or darken (f<0) a colour */
function shade(col, f) {
  const key = col + '|' + f; if (_sc[key]) return _sc[key];
  let r, g, b, m;
  if ((m = /^#([0-9a-f]{6})$/i.exec(col))) { const n = parseInt(m[1], 16); r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255; }
  else if ((m = /^#([0-9a-f]{3})$/i.exec(col))) { r = parseInt(m[1][0] + m[1][0], 16); g = parseInt(m[1][1] + m[1][1], 16); b = parseInt(m[1][2] + m[1][2], 16); }
  else if ((m = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(col))) { r = +m[1]; g = +m[2]; b = +m[3]; }
  else return col;
  const t = f > 0 ? 255 : 0, a = Math.abs(f);
  return (_sc[key] = `rgb(${Math.round(r + (t - r) * a)},${Math.round(g + (t - g) * a)},${Math.round(b + (t - b) * a)})`);
}
const sn = (v) => Math.round(v * S) / S;
/* solid shapes get a soft light-to-shadow gradient so they read as round, lit objects */
function R(c, x, y, w, h, col) {
  const x0 = sn(x), y0 = sn(y), ww = sn(x + w) - x0, hh = sn(y + h) - y0;
  if (Math.abs(ww) >= 3 && Math.abs(hh) >= 3) {
    let g;
    if (Math.abs(hh) > Math.abs(ww) * 1.6) {
      g = c.createLinearGradient(x0, 0, x0 + ww, 0);
      g.addColorStop(0, shade(col, -0.18)); g.addColorStop(0.35, shade(col, 0.22)); g.addColorStop(1, shade(col, -0.3));
    } else {
      g = c.createLinearGradient(0, y0, 0, y0 + hh);
      g.addColorStop(0, shade(col, 0.16)); g.addColorStop(1, shade(col, -0.2));
    }
    c.fillStyle = g;
  } else c.fillStyle = col;
  c.fillRect(x0, y0, ww, hh);
}
function rr(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function shadowEl(c, x, y, rx, ry, a) { c.fillStyle = `rgba(10,20,30,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function disc(c, cx, cy, r, col, flat) {
  const rad = r + 0.5;
  c.beginPath(); c.arc(cx, cy, rad, 0, TAU);
  if (!flat && r >= 2.4) {
    const g = c.createRadialGradient(cx - rad * 0.35, cy - rad * 0.4, rad * 0.1, cx, cy, rad);
    g.addColorStop(0, shade(col, 0.4)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, -0.3));
    c.fillStyle = g;
  } else c.fillStyle = col;
  c.fill();
}
function ring(c, cx, cy, r, th, col) { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.lineWidth = th; c.strokeStyle = col; c.stroke(); }
function line(c, x0, y0, x1, y1, col, th) {
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1);
  c.lineWidth = th || 1; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
}
const FONT = (size) => `600 ${Math.round((size || 8) * 1.25 * 10) / 10}px 'Fredoka', system-ui, sans-serif`;
function txt(c, s, x, y, col, size, align, shadow) {
  c.font = FONT(size); c.textAlign = align || 'left'; c.textBaseline = 'top';
  if (shadow !== false) { c.fillStyle = K.dark; c.fillText(s, x + 0.8, y + 0.8); }
  c.fillStyle = col || K.ink; c.fillText(s, x, y);
}
function vignette(c) {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,5,30,0.28)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function mk(w, h) { const e = document.createElement('canvas'); e.width = w; e.height = h; return e; }

/* one-pixel white outline that follows a silhouette. paint(ctx) draws the object */
function dilate(src, w, h, r, color) { // w, h, r in device pixels
  const m = mk(w, h), mc = m.getContext('2d');
  mc.drawImage(src, 0, 0); mc.globalCompositeOperation = 'source-in'; mc.fillStyle = color; mc.fillRect(0, 0, w, h);
  const o = mk(w, h), oc = o.getContext('2d');
  oc.drawImage(m, 0, 0);
  [[1, 56], [0.7, 40], [0.4, 24]].forEach(([f, n]) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; oc.drawImage(m, Math.cos(a) * r * f, Math.sin(a) * r * f); }
  });
  return o;
}
/* a smooth halo around the whole ride: a white line with a dark line outside it */
function makeOutline(w, h, paint, r) {
  r = (r || 4) * S; const W2 = w * S, H2 = h * S;
  const a = mk(W2, H2), ac = a.getContext('2d'); ac.scale(S, S); paint(ac);
  const o = mk(W2, H2), oc = o.getContext('2d');
  oc.drawImage(dilate(a, W2, H2, r + 2 * S, K.dark), 0, 0);
  oc.drawImage(dilate(a, W2, H2, r + S, '#ffffff'), 0, 0);
  oc.globalCompositeOperation = 'destination-out';
  oc.drawImage(dilate(a, W2, H2, r, '#000000'), 0, 0);
  return o;
}
/* text on a dark plate so it stays readable over sky, clouds and grass */
function ptxt(c, s, x, y, col, size, align) {
  size = size || 8;
  c.font = FONT(size);
  const tw = Math.ceil(c.measureText(s).width), ax = align === 'right' ? x - tw : align === 'center' ? x - tw / 2 : x;
  c.globalAlpha = 0.6; rr(c, ax - 4, y - 2, tw + 8, size + 5, 3, K.dark); c.globalAlpha = 1;
  txt(c, s, x, y, col, size, align, false);
}

function sprite(c, rows, pal, x, y, s, flip) {
  s = s || 1;
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]; if (ch === '.') continue;
      c.fillStyle = pal[ch] || K.ink;
      const xi = flip ? row.length - 1 - i : i;
      c.fillRect(Math.round(x + xi * s), Math.round(y + j * s), s, s);
    }
  });
}

function fix(x, d) {
  let v = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
  if (Object.is(v, -0)) v = 0;
  return v.toFixed(d);
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* optional */ } }

/* ===== Amusement park sound (all synthesized, starts after the first tap) ===== */
const Snd = (function () {
  let ac = null, master = null, musicBus = null, fxBus = null, on = true, started = false;
  let nextNote = 0, step = 0, musicLevel = 0.1, synthMuted = false;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* "Moonlit Carousel": slow, soft 4/4 lullaby in C major with a gentle harp arpeggio */
  const MEL = [
    [76, 2], [79, 1], [76, 1], [84, 2], [81, 1], [79, 1], [81, 2], [79, 1], [77, 1], [74, 1], [76, 1], [79, 2],
    [79, 2], [76, 1], [74, 1], [76, 1], [81, 1], [84, 2], [81, 1], [79, 1], [77, 2], [79, 1], [74, 1], [76, 2],
  ];
  const BARS = [
    [[48, 55, 59, 64], [60, 64, 67, 71]], [[45, 52, 55, 60], [57, 60, 64, 67]], [[41, 48, 52, 57], [53, 57, 60, 64]], [[43, 50, 55, 59], [55, 59, 62, 64]],
    [[48, 55, 59, 64], [60, 64, 67, 71]], [[45, 52, 55, 60], [57, 60, 64, 67]], [[41, 48, 52, 57], [53, 57, 60, 64]], [[43, 50, 55, 59], [55, 59, 62, 64]],
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  const BEAT = 0.8;
  let melIdx = 0, melT = 0, barIdx = 0, eighth = 0;

  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = on ? 0.9 : 0; master.connect(ac.destination);
    fxBus = ac.createGain(); fxBus.gain.value = 0.9; fxBus.connect(master);

    // music bus: lowpass + a little echo
    musicBus = ac.createGain(); musicBus.gain.value = synthMuted ? 0 : musicLevel * 2.2;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700;
    const dl = ac.createDelay(); dl.delayTime.value = 0.36;
    const fb = ac.createGain(); fb.gain.value = 0.38;
    musicBus.connect(lp); lp.connect(master); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);


    nextNote = ac.currentTime + 0.1;
    scheduler(); /* no crowd murmur, chatter or screams: only the music and the small button sounds */
  }

  function tone(freq, t0, dur, type, vol, bus, glideTo) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || fxBus); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, f0, f1, vol, type) {
    const len = Math.ceil(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = type || 'lowpass';
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(fxBus); s.start(t0);
  }

  function soft(freq, t0, dur, vol, type) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(musicBus); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function pad(freq, t0, dur, vol) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.9); g.gain.setValueAtTime(vol, t0 + dur - 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(musicBus); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function scheduler() {
    const ahead = ac.currentTime + 0.35, E = BEAT / 2;
    while (nextNote < ahead) {
      if (melT <= 0) {
        const [m, b] = MEL[melIdx % MEL.length];
        soft(mtof(m), nextNote, b * BEAT * 1.5, 0.42); soft(mtof(m + 12), nextNote, b * BEAT * 0.9, 0.05);
        melT = b; melIdx++;
      }
      const bar = BARS[barIdx % BARS.length], e = eighth % 8;
      if (e === 0) { bar[0].forEach((m) => pad(mtof(m), nextNote, BEAT * 4 + 1, 0.11)); soft(mtof(bar[0][0] - 12), nextNote, BEAT * 3, 0.35); }
      soft(mtof(bar[1][ARP[e]]), nextNote, BEAT * 1.6, 0.2);
      melT -= 0.5; eighth++; if (eighth % 8 === 0) barIdx++;
      nextNote += E;
    }
    setTimeout(scheduler, 120);
  }

  function chatter() {
    if (ac && on && ac.state === 'running') {
      const t0 = ac.currentTime, n = Math.random() < 0.25 ? ri(3, 5) : 1;
      for (let i = 0; i < n; i++) {
        const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), p = ac.createStereoPanner();
        const base = rnd(110, 260), t = t0 + i * 0.11, dur = rnd(0.07, 0.18);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * rnd(0.85, 1.2), t + dur);
        f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(rnd(500, 1000), t); f.frequency.linearRampToValueAtTime(rnd(900, 1900), t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.018, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        p.pan.value = rnd(-0.8, 0.8);
        o.connect(f); f.connect(g); g.connect(p); p.connect(master); o.start(t); o.stop(t + dur + 0.05);
      }
    }
    setTimeout(chatter, rnd(140, 520));
  }

  function screams() {
    if (ac && on && ac.state === 'running' && musicLevel > 0) {
      const t0 = ac.currentTime, base = rnd(650, 900);
      const o = ac.createOscillator(), v = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain(), lp = ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.setValueAtTime(base, t0);
      o.frequency.linearRampToValueAtTime(base * 1.7, t0 + 0.35); o.frequency.linearRampToValueAtTime(base * 1.2, t0 + 0.8);
      v.frequency.value = 22; vg.gain.value = 40; v.connect(vg); vg.connect(o.frequency);
      lp.type = 'lowpass'; lp.frequency.value = 2200;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.012, t0 + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
      o.connect(lp); lp.connect(g); g.connect(master);
      o.start(t0); v.start(t0); o.stop(t0 + 0.9); v.stop(t0 + 0.9);
    }
    setTimeout(screams, rnd(5000, 11000));
  }

  const SFX = {
    click() { const t = ac.currentTime; tone(520, t, 0.06, 'square', 0.12); tone(780, t + 0.05, 0.07, 'square', 0.12); },
    pick() { const t = ac.currentTime; tone(400, t, 0.07, 'square', 0.14); tone(600, t + 0.06, 0.07, 'square', 0.14); tone(900, t + 0.12, 0.1, 'square', 0.14); },
    boom() { const t = ac.currentTime; noise(t, 0.5, 900, 60, 0.9, 'lowpass'); tone(120, t, 0.35, 'sine', 0.8, fxBus, 40); },
    whoosh() { const t = ac.currentTime; noise(t, 1.1, 2600, 200, 0.35, 'bandpass'); },
    ding() { const t = ac.currentTime; tone(880, t, 0.18, 'sine', 0.25); tone(1320, t + 0.1, 0.3, 'sine', 0.22); },
    buzz() { const t = ac.currentTime; tone(150, t, 0.25, 'sawtooth', 0.18); },
    bell() { const t = ac.currentTime; tone(1046, t, 0.5, 'sine', 0.2); tone(1568, t, 0.4, 'sine', 0.1); },
    clack() { const t = ac.currentTime; noise(t, 0.05, 3000, 800, 0.2, 'highpass'); },
    splat() { const t = ac.currentTime; noise(t, 0.22, 1400, 200, 0.4, 'lowpass'); },
  };

  return {
    start() {
      if (!started) { started = true; try { init(); } catch (e) { started = false; return; } }
      if (ac && ac.state === 'suspended') ac.resume();
    },
    toggle() {
      on = !on;
      if (master) master.gain.setTargetAtTime(on ? 0.9 : 0, ac.currentTime, 0.05);
      return on;
    },
    isOn() { return on; },
    /* quieter music inside a ride so the physics is easier to hear and read */
    level(x) { musicLevel = x; if (musicBus && !synthMuted) musicBus.gain.setTargetAtTime(x * 2.2, ac.currentTime, 0.2); },
    /* mute the built-in synth song while the YouTube theme song is playing */
    mute(m) { synthMuted = m; if (musicBus) musicBus.gain.setTargetAtTime(m ? 0 : musicLevel * 2.2, ac.currentTime, 0.15); },
    sfx(name) { try { if (ac && on && SFX[name]) SFX[name](); } catch (e) { /* optional */ } },
  };
})();

/* ===== Physics solvers ===== */
const G = 9.8;
const f2 = (x) => fix(x, 2);

/* smallest positive root of a t^2 + b t + c = 0 */
function posRoot(a, b, c) {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) return null;
    const t = -c / b; return t >= 0 ? t : null;
  }
  const d = b * b - 4 * a * c; if (d < 0) return null;
  const sq = Math.sqrt(d), r = [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].sort((x, y) => x - y);
  const pos = r.filter((x) => x > 1e-9);
  if (pos.length) return pos[0];
  return r.some((x) => x >= -1e-9) ? 0 : null;
}

/* Any 3 of s (displacement), u (initial velocity), v (final velocity), a (acceleration), t (time) give the rest. */
function solveKin(k) {
  const v = {}, steps = [], warns = [];
  ['s', 'u', 'v', 'a', 't'].forEach((n) => { v[n] = k[n] === undefined || k[n] === null || Number.isNaN(k[n]) ? null : k[n]; });
  const known0 = ['s', 'u', 'v', 'a', 't'].filter((n) => v[n] !== null);
  if (known0.length < 3) return { error: `I need at least 3 of the 5 measurements. You gave ${known0.length}.` };
  const has = (...n) => n.every((x) => v[x] !== null);
  const set = (n, val, step) => { steps.push(kinStep(n, v, val) || step); v[n] = val; return true; };
  const bad = (m) => ({ error: m });
  let progress = true, guard = 0;
  while (progress && guard++ < 12 && Object.values(v).some((x) => x === null)) {
    progress = false;
    if (v.v === null) {
      if (has('u', 'a', 't')) progress = set('v', v.u + v.a * v.t, `v = u + at = ${f2(v.u)} + ${f2(v.a)}×${f2(v.t)} = ${f2(v.u + v.a * v.t)} m/s`);
      else if (has('u', 'a', 's')) {
        const q = v.u * v.u + 2 * v.a * v.s;
        if (q < 0) return bad('These numbers do not work: Vf² would be negative, so the ride never reaches that distance.');
        const sg = v.u !== 0 ? Math.sign(v.u) : (Math.sign(v.a) || 1), val = sg * Math.sqrt(q);
        progress = set('v', val, `v² = u² + 2as = ${f2(v.u)}² + 2×${f2(v.a)}×${f2(v.s)} = ${f2(q)}, so v = ${f2(val)} m/s`);
      } else if (has('u', 't', 's') && v.t !== 0) progress = set('v', (2 * v.s) / v.t - v.u, `v = 2s/t − u = 2×${f2(v.s)}/${f2(v.t)} − ${f2(v.u)} = ${f2((2 * v.s) / v.t - v.u)} m/s`);
      else if (has('a', 't', 's') && v.t !== 0) progress = set('v', v.s / v.t + (v.a * v.t) / 2, `v = s/t + at/2 = ${f2(v.s)}/${f2(v.t)} + ${f2(v.a)}×${f2(v.t)}/2 = ${f2(v.s / v.t + (v.a * v.t) / 2)} m/s`);
    }
    if (v.u === null) {
      if (has('v', 'a', 't')) progress = set('u', v.v - v.a * v.t, `u = v − at = ${f2(v.v)} − ${f2(v.a)}×${f2(v.t)} = ${f2(v.v - v.a * v.t)} m/s`);
      else if (has('v', 'a', 's')) {
        const q = v.v * v.v - 2 * v.a * v.s;
        if (q < 0) return bad('These numbers do not work: Vi² would be negative.');
        const sg = v.v !== 0 ? Math.sign(v.v) : 1, val = sg * Math.sqrt(q);
        progress = set('u', val, `u² = v² − 2as = ${f2(v.v)}² − 2×${f2(v.a)}×${f2(v.s)} = ${f2(q)}, so u = ${f2(val)} m/s`);
      } else if (has('v', 't', 's') && v.t !== 0) progress = set('u', (2 * v.s) / v.t - v.v, `u = 2s/t − v = 2×${f2(v.s)}/${f2(v.t)} − ${f2(v.v)} = ${f2((2 * v.s) / v.t - v.v)} m/s`);
      else if (has('a', 't', 's') && v.t !== 0) progress = set('u', v.s / v.t - (v.a * v.t) / 2, `u = s/t − at/2 = ${f2(v.s)}/${f2(v.t)} − ${f2(v.a)}×${f2(v.t)}/2 = ${f2(v.s / v.t - (v.a * v.t) / 2)} m/s`);
    }
    if (v.a === null) {
      if (has('u', 'v', 't') && v.t !== 0) progress = set('a', (v.v - v.u) / v.t, `a = (v − u)/t = (${f2(v.v)} − ${f2(v.u)})/${f2(v.t)} = ${f2((v.v - v.u) / v.t)} m/s²`);
      else if (has('u', 'v', 's') && v.s !== 0) progress = set('a', (v.v * v.v - v.u * v.u) / (2 * v.s), `a = (v² − u²)/(2s) = (${f2(v.v)}² − ${f2(v.u)}²)/(2×${f2(v.s)}) = ${f2((v.v * v.v - v.u * v.u) / (2 * v.s))} m/s²`);
      else if (has('u', 't', 's') && v.t !== 0) progress = set('a', (2 * (v.s - v.u * v.t)) / (v.t * v.t), `a = 2(s − ut)/t² = 2×(${f2(v.s)} − ${f2(v.u)}×${f2(v.t)})/${f2(v.t)}² = ${f2((2 * (v.s - v.u * v.t)) / (v.t * v.t))} m/s²`);
      else if (has('v', 't', 's') && v.t !== 0) progress = set('a', (2 * (v.v * v.t - v.s)) / (v.t * v.t), `a = 2(vt − s)/t² = 2×(${f2(v.v)}×${f2(v.t)} − ${f2(v.s)})/${f2(v.t)}² = ${f2((2 * (v.v * v.t - v.s)) / (v.t * v.t))} m/s²`);
    }
    if (v.t === null) {
      if (has('u', 'v', 'a') && v.a !== 0) progress = set('t', (v.v - v.u) / v.a, `t = (v − u)/a = (${f2(v.v)} − ${f2(v.u)})/${f2(v.a)} = ${f2((v.v - v.u) / v.a)} s`);
      else if (has('u', 'v', 's') && v.u + v.v !== 0) progress = set('t', (2 * v.s) / (v.u + v.v), `t = 2s/(u + v) = 2×${f2(v.s)}/(${f2(v.u)} + ${f2(v.v)}) = ${f2((2 * v.s) / (v.u + v.v))} s`);
      else if (has('u', 'a', 's')) {
        const t = posRoot(0.5 * v.a, v.u, -v.s);
        if (t === null) return bad('No real time fits those numbers. Check the signs of Vi, a and Δx.');
        progress = set('t', t, `s = ut + ½at² → ½×${f2(v.a)}×t² + ${f2(v.u)}×t − ${f2(v.s)} = 0, so t = ${f2(t)} s`);
      } else if (has('v', 'a', 's')) {
        const t = posRoot(0.5 * v.a, -v.v, v.s);
        if (t === null) return bad('No real time fits those numbers. Check the signs of Vf, a and Δx.');
        progress = set('t', t, `s = vt − ½at² → ½×${f2(v.a)}×t² − ${f2(v.v)}×t + ${f2(v.s)} = 0, so t = ${f2(t)} s`);
      }
    }
    if (v.s === null) {
      if (has('u', 'a', 't')) progress = set('s', v.u * v.t + 0.5 * v.a * v.t * v.t, `s = ut + ½at² = ${f2(v.u)}×${f2(v.t)} + ½×${f2(v.a)}×${f2(v.t)}² = ${f2(v.u * v.t + 0.5 * v.a * v.t * v.t)} m`);
      else if (has('u', 'v', 't')) progress = set('s', 0.5 * (v.u + v.v) * v.t, `s = ½(u + v)t = ½×(${f2(v.u)} + ${f2(v.v)})×${f2(v.t)} = ${f2(0.5 * (v.u + v.v) * v.t)} m`);
      else if (has('u', 'v', 'a') && v.a !== 0) progress = set('s', (v.v * v.v - v.u * v.u) / (2 * v.a), `s = (v² − u²)/(2a) = (${f2(v.v)}² − ${f2(v.u)}²)/(2×${f2(v.a)}) = ${f2((v.v * v.v - v.u * v.u) / (2 * v.a))} m`);
      else if (has('v', 'a', 't')) progress = set('s', v.v * v.t - 0.5 * v.a * v.t * v.t, `s = vt − ½at² = ${f2(v.v)}×${f2(v.t)} − ½×${f2(v.a)}×${f2(v.t)}² = ${f2(v.v * v.t - 0.5 * v.a * v.t * v.t)} m`);
    }
  }
  if (Object.values(v).some((x) => x === null)) return bad('That mix of numbers cannot be solved (something would divide by zero). Try a different set of three.');
  if (v.t < -1e-9) return bad('Time came out negative. Check the signs of your numbers.');
  const chk = [[v.v, v.u + v.a * v.t], [v.s, v.u * v.t + 0.5 * v.a * v.t * v.t]];
  if (known0.length >= 4 && chk.some(([x, y]) => Math.abs(x - y) > Math.max(0.05, 0.02 * Math.abs(y)))) warns.push('Your numbers do not agree with each other, so I used the first three that fit.');
  return { vals: v, steps, warns, given: known0 };
}

const KIN_ROWS = [
  ['s', 'Displacement Δx', 'm'], ['t', 'Time t', 's'], ['v', 'Final velocity Vf', 'm/s'],
  ['a', 'Acceleration a', 'm/s²'], ['u', 'Initial velocity Vi', 'm/s'],
];
function kinRows(res) {
  return KIN_ROWS.map(([k, label, unit]) => ({ label, unit, val: res.vals[k], calc: res.given.indexOf(k) < 0 }));
}

/* ----- projectile ----- */
function trajectory(v0, angDeg, h0) {
  const th = (angDeg * Math.PI) / 180, vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
  const T = (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G;
  return { vx, vy, T, range: vx * T, hmax: h0 + (vy > 0 ? (vy * vy) / (2 * G) : 0), tpeak: Math.max(0, vy / G),
    vimp: Math.hypot(vx, vy - G * T), angImp: (Math.atan2(G * T - vy, vx) * 180) / Math.PI };
}

/* ----- ride solvers: each returns {rows, steps, warns, data, T} or {error} ----- */
const SOLVE = {
  ferris(i) {
    if (i.r === null || i.r <= 0) return { error: 'Give the wheel a radius r above zero.' };
    const res = solveKin(i); if (res.error) return res;
    const v = res.vals, r = i.r;
    const th = v.s / r, rev = th / TAU, w0 = v.u / r, w = v.v / r, al = v.a / r, ac = (v.v * v.v) / r;
    const rows = kinRows(res).concat([
      { label: 'Angle turned θ = s/r', unit: 'rad', val: th, calc: true },
      { label: 'Full turns', unit: 'rev', val: rev, calc: true },
      { label: 'Spin speed ω = v/r', unit: 'rad/s', val: w, calc: true },
      { label: 'Pull to centre v²/r', unit: 'm/s²', val: ac, calc: true },
    ]);
    const steps = res.steps.concat([`θ = s/r = ${f2(v.s)}/${f2(r)} = ${f2(th)} rad (${f2(rev)} turns)`, `ω₀ = u/r = ${f2(w0)} rad/s, ω = v/r = ${f2(w)} rad/s, α = a/r = ${f2(al)} rad/s²`, `a꜀ = v²/r = ${f2(v.v)}²/${f2(r)} = ${f2(ac)} m/s²`]);
    return { rows, steps, warns: res.warns, data: { r, u: v.u, a: v.a, s: v.s }, T: v.t };
  },

  coaster(i) {
    const k = { s: i.s, u: i.u, v: i.v, a: i.a, t: i.t }, pre = [];
    if (i.ang === null || i.ang < 5 || i.ang > 85) return { error: 'Set the slope angle between 5° and 85°.' };
    const mu = i.mu === null ? 0 : i.mu, th = (i.ang * Math.PI) / 180;
    if (k.a === null) {
      k.a = G * (Math.sin(th) - mu * Math.cos(th));
      pre.push(`a = g(sin θ − μ cos θ) = 9.8×(sin ${f2(i.ang)}° − ${f2(mu)}×cos ${f2(i.ang)}°) = ${f2(k.a)} m/s²`);
      if (k.a <= 0) return { error: 'Friction is too high: the car would not slide down this slope.' };
    }
    const res = solveKin(k); if (res.error) return res;
    const v = res.vals, h = v.s * Math.sin(th);
    const given = res.given.filter((x) => x !== 'a' || i.a !== null);
    const rows = kinRows({ vals: v, given: i.a === null ? given.filter((x) => x !== 'a') : given }).concat([
      { label: 'Vertical drop h = Δx sin θ', unit: 'm', val: h, calc: true },
      { label: 'Top speed', unit: 'km/h', val: v.v * 3.6, calc: true },
    ]);
    const steps = pre.concat(res.steps, [`h = Δx sin θ = ${f2(v.s)}×sin ${f2(i.ang)}° = ${f2(h)} m`]);
    return { rows, steps, warns: res.warns, data: { ang: i.ang, u: v.u, a: v.a, s: v.s }, T: v.t };
  },

  drop(i) {
    const res = solveKin(i); if (res.error) return res;
    const v = res.vals, rows = kinRows(res).concat([{ label: 'Rider feels (a/g)', unit: 'g', val: v.a / G, calc: true }]);
    return { rows, steps: res.steps.concat([`Rider pull = a/g = ${f2(v.a)}/9.8 = ${f2(v.a / G)} g`]), warns: res.warns,
      data: { u: v.u, a: v.a, s: v.s }, T: v.t };
  },

  cannon(i) {
    if (i.ang === null || i.ang <= 0 || i.ang >= 90) return { error: 'Set the cannon angle between 0° and 90°.' };
    const h0 = i.h0 === null ? 0 : i.h0, steps = [];
    let v0 = i.v0, calc0 = false;
    if (v0 === null) {
      if (i.rng === null) return { error: 'Give me a launch speed, or a range so I can work out the speed.' };
      let lo = 0, hi = 300;
      if (trajectory(hi, i.ang, h0).range < i.rng) return { error: 'That range needs more than 300 m/s. Try a different angle.' };
      for (let n = 0; n < 60; n++) { const mid = (lo + hi) / 2; if (trajectory(mid, i.ang, h0).range < i.rng) lo = mid; else hi = mid; }
      v0 = (lo + hi) / 2; calc0 = true;
      steps.push(h0 === 0 ? `R = v₀² sin 2θ / g → v₀ = √(R g / sin 2θ) = √(${f2(i.rng)}×9.8 / sin ${f2(2 * i.ang)}°) = ${f2(v0)} m/s` : `Solved R(v₀) = ${f2(i.rng)} m numerically, giving v₀ = ${f2(v0)} m/s`);
    }
    if (v0 <= 0) return { error: 'Launch speed must be above zero.' };
    const tr = trajectory(v0, i.ang, h0);
    steps.push(`vₓ = v₀ cos θ = ${f2(tr.vx)} m/s,  v_y = v₀ sin θ = ${f2(tr.vy)} m/s`,
      `Flight time: h₀ + v_y t − ½gt² = 0 → t = ${f2(tr.T)} s`, `Range: x = vₓ t = ${f2(tr.vx)}×${f2(tr.T)} = ${f2(tr.range)} m`,
      `Highest point: h₀ + v_y²/(2g) = ${f2(tr.hmax)} m, reached at ${f2(tr.tpeak)} s`, `Landing speed = ${f2(tr.vimp)} m/s`);
    const rows = [
      { label: 'Displacement (range)', unit: 'm', val: tr.range, calc: true }, { label: 'Time in the air', unit: 's', val: tr.T, calc: true },
      { label: 'Landing velocity', unit: 'm/s', val: tr.vimp, calc: true }, { label: 'Acceleration (gravity)', unit: 'm/s²', val: -G, calc: true },
      { label: 'Initial velocity', unit: 'm/s', val: v0, calc: calc0 }, { label: 'Highest point', unit: 'm', val: tr.hmax, calc: true },
    ];
    return { rows, steps, warns: [], data: { v0, ang: i.ang, h0, tr }, T: tr.T };
  },

  carousel(i) {
    if (i.r === null || i.r <= 0) return { error: 'Give the carousel a radius r above zero.' };
    const r = i.r, steps = [], warns = [];
    let T = null;
    if (i.T !== null) { T = i.T; steps.push(`Period given: T = ${f2(T)} s`); }
    else if (i.w !== null) { T = TAU / i.w; steps.push(`T = 2π/ω = 2π/${f2(i.w)} = ${f2(T)} s`); }
    else if (i.v !== null) { T = (TAU * r) / i.v; steps.push(`T = 2πr/v = 2π×${f2(r)}/${f2(i.v)} = ${f2(T)} s`); }
    else return { error: 'Give one of: period T, spin speed ω, or rim speed v.' };
    if (!(T > 0)) return { error: 'The period must be above zero.' };
    const w = TAU / T, v = w * r, ac = w * w * r, m = i.m === null ? 40 : i.m, F = m * ac;
    if (i.w !== null && i.T !== null && Math.abs(TAU / i.T - i.w) > 0.02 * i.w) warns.push('T and ω do not agree, so I used T.');
    steps.push(`ω = 2π/T = ${f2(w)} rad/s`, `v = ωr = ${f2(w)}×${f2(r)} = ${f2(v)} m/s`, `a꜀ = ω²r = ${f2(ac)} m/s²`, `F = m a꜀ = ${f2(m)}×${f2(ac)} = ${f2(F)} N`);
    const run = i.t === null ? T * 2 : i.t, s = v * run, th = w * run;
    steps.push(`In ${f2(run)} s: s = vt = ${f2(s)} m, θ = ωt = ${f2(th)} rad (${f2(th / TAU)} turns)`);
    const rows = [
      { label: 'Displacement along rim', unit: 'm', val: s, calc: true }, { label: 'Time', unit: 's', val: run, calc: i.t === null },
      { label: 'Rim velocity', unit: 'm/s', val: v, calc: i.v === null }, { label: 'Centripetal accel.', unit: 'm/s²', val: ac, calc: true },
      { label: 'Initial velocity', unit: 'm/s', val: v, calc: true }, { label: 'Period T', unit: 's', val: T, calc: i.T === null },
      { label: 'Spin speed ω', unit: 'rad/s', val: w, calc: i.w === null }, { label: 'Force on rider', unit: 'N', val: F, calc: true },
    ];
    return { rows, steps, warns, data: { r, w }, T: run };
  },

  pirate(i) {
    if (i.L === null || i.L <= 0) return { error: 'Give the ship a swing length L above zero.' };
    if (i.ang === null || i.ang <= 0 || i.ang > 80) return { error: 'Set the swing angle between 1° and 80°.' };
    const L = i.L, th0 = (i.ang * Math.PI) / 180, w = Math.sqrt(G / L), T0 = TAU / w;
    const Tc = T0 * (1 + (th0 * th0) / 16 + (11 * Math.pow(th0, 4)) / 3072);
    const vmax = Math.sqrt(2 * G * L * (1 - Math.cos(th0))), ac = (vmax * vmax) / L, s = L * th0;
    const steps = [`Small-swing period T₀ = 2π√(L/g) = 2π√(${f2(L)}/9.8) = ${f2(T0)} s`, `Corrected for a big swing: T = ${f2(Tc)} s`,
      `Speed at the bottom: v = √(2gL(1 − cos θ₀)) = ${f2(vmax)} m/s`, `Pull at the bottom: a = v²/L = ${f2(ac)} m/s²`,
      `Arc from the bottom to the top of the swing: s = Lθ₀ = ${f2(L)}×${f2(th0)} = ${f2(s)} m`, `Time from the top to the bottom: T/4 = ${f2(Tc / 4)} s`];
    const rows = [
      { label: 'Displacement (arc)', unit: 'm', val: s, calc: true }, { label: 'Time to bottom', unit: 's', val: Tc / 4, calc: true },
      { label: 'Max velocity', unit: 'm/s', val: vmax, calc: true }, { label: 'Max acceleration', unit: 'm/s²', val: ac, calc: true },
      { label: 'Initial velocity', unit: 'm/s', val: 0, calc: true }, { label: 'Full swing period', unit: 's', val: Tc, calc: true },
    ];
    if (i.t !== null) {
      const ph = (TAU * i.t) / Tc, a = th0 * Math.cos(ph), sp = L * th0 * (TAU / Tc) * Math.abs(Math.sin(ph));
      rows.push({ label: `Angle at t = ${f2(i.t)} s`, unit: '°', val: (a * 180) / Math.PI, calc: true }, { label: 'Speed at that time', unit: 'm/s', val: sp, calc: true });
      steps.push(`At t = ${f2(i.t)} s: θ = θ₀ cos(2πt/T) = ${f2((a * 180) / Math.PI)}°, speed ≈ ${f2(sp)} m/s`);
    }
    return { rows, steps, warns: [], data: { L, th0, Tc }, T: i.t === null ? Tc * 3 : i.t };
  },
};

/* ===== Rides part 1: Ferris wheel, roller coaster, cannon ===== */
const RIDES = {};
const GROUND = 176; // ground line on ride screens

function hud(c, rows) {
  rows.forEach((r, j) => ptxt(c, `${r[0]} ${r[1]}${r[2] ? ' ' + r[2] : ''}`, 8, 8 + j * 13, r[3] || K.ink, 8));
}
const kinS = (d, tau) => d.u * tau + 0.5 * d.a * tau * tau;
const kinV = (d, tau) => d.u + d.a * tau;

/* ---------- Ferris wheel ---------- */
function drawFerris(c, cx, by, Rr, ang, night, trace) {
  const hubY = Math.round(by - Rr - 10);
  const steel = night ? '#6b45b0' : K.steel, steelD = night ? '#2c1a55' : K.steelD;
  line(c, cx, hubY, cx - Rr * 0.6, by, steelD, 2);
  line(c, cx, hubY, cx + Rr * 0.6, by, steelD, 2);
  const bf = 0.62, bx = Rr * 0.6 * bf, byy = hubY + (by - hubY) * bf;
  line(c, cx - bx, byy, cx + bx, byy, steelD, 1);
  R(c, cx - Rr * 0.75, by - 2, Rr * 1.5, 3, steelD);
  ring(c, cx, hubY, Rr, 2, steel);
  ring(c, cx, hubY, Rr * 0.45, 1, steel);
  for (let i = 0; i < 12; i++) {
    const a = ang + (i * TAU) / 12;
    line(c, cx, hubY, cx + Rr * Math.cos(a), hubY + Rr * Math.sin(a), steel, 1);
  }
  const blink = Math.floor(ang * 5);
  for (let i = 0; i < 24; i++) {
    const a = (i * TAU) / 24;
    disc(c, cx + (Rr + 2) * Math.cos(a), hubY + (Rr + 2) * Math.sin(a), 1, (i + blink) % 2 ? K.yellow : (night ? K.pink : K.white), true);
  }
  const cols = [K.red, K.blue, K.green, K.pink, K.orange, K.purple], gw = Math.max(3, Math.round(Rr / 13));
  for (let i = 0; i < 12; i++) {
    const a = ang + (i * TAU) / 12, px = cx + Rr * Math.cos(a), py = hubY + Rr * Math.sin(a);
    line(c, px, py, px, py + 3, steelD, 1);
    R(c, px - gw, py + 3, gw * 2, gw + 2, cols[i % 6]);
    R(c, px - gw, py + 3, gw * 2, 1, K.white);
    if (night) R(c, px - gw + 1, py + 5, gw * 2 - 2, 1, K.yellow);
    if (i === 0 && trace) { R(c, px - gw - 1, py + 2, gw * 2 + 2, gw + 4, K.white); R(c, px - gw, py + 3, gw * 2, gw + 2, K.red); disc(c, px, py + 2, 2, K.yellow); }
  }
  disc(c, cx, hubY, 3, K.red); disc(c, cx, hubY, 1, K.yellow);
  if (trace) {
    const span = Math.min(trace.to - trace.from, TAU), n = Math.floor((span * (Rr + 8)) / 5);
    for (let i = 0; i <= n; i++) {
      const a = trace.from + (span * i) / Math.max(1, n);
      disc(c, cx + (Rr + 8) * Math.cos(a), hubY + (Rr + 8) * Math.sin(a), 1, K.pink, true);
    }
  }
}

RIDES.ferris = {
  id: 'ferris', name: 'Ferris Wheel', cycle: 1.75, outT: [0, 0.9],
  blurb: 'A rider moves along the rim. The distance around the rim is the displacement s. Give 3 of the 5 measurements.',
  fields: [
    { k: 'r', label: 'Wheel radius r', unit: 'm', def: '12' },
    { k: 's', label: 'Displacement Δx', unit: 'm' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final velocity Vf', unit: 'm/s' }, { k: 'a', label: 'Acceleration a', unit: 'm/s²' },
    { k: 'u', label: 'Initial velocity Vi', unit: 'm/s' },
  ],
  example: { r: '12', u: '0', a: '0.4', t: '25' },
  box: { x0: -46, y0: -96, x1: 46, y1: 3 },
  park(c, x, y, t, night) { drawFerris(c, x, y, 40, t * 0.35, night); },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['V', '0.0', 'm/s', K.green], ['Δx', '0.0', 'm', K.ink]];
    const d = st.data;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['V', fix(kinV(d, st.tau), 1), 'm/s', K.green], ['Δx', fix(kinS(d, st.tau), 1), 'm', K.ink]];
  },
  scene(c, st, now) {
    const Rr = 72, cx = 192;
    let th = now * 0.2, trace = null;
    if (st) { th = kinS(st.data, st.tau) / st.data.r; trace = { from: Math.PI / 2, to: Math.PI / 2 + th }; }
    drawFerris(c, cx, GROUND - 4, Rr, Math.PI / 2 + th, false, trace);
    if (st) ptxt(c, `θ ${fix(th / TAU, 2)} turns`, W - 8, 8, K.pink, 8, 'right');
  },
};

/* ---------- Roller coaster ---------- */
function buildPath(pts) {
  const out = []; let d = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len)), ang = Math.atan2(y1 - y0, x1 - x0);
    for (let j = 0; j < n; j++) out.push({ x: x0 + ((x1 - x0) * j) / n, y: y0 + ((y1 - y0) * j) / n, ang, d: d + (len * j) / n });
    d += len;
  }
  const l = pts[pts.length - 1]; out.push({ x: l[0], y: l[1], ang: out[out.length - 1].ang, d });
  return { p: out, len: d };
}
function pathAt(P, d) {
  d = clamp(d, 0, P.len);
  let lo = 0, hi = P.p.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (P.p[m].d < d) lo = m + 1; else hi = m; }
  return P.p[lo];
}
function drawTrack(c, P, ground, x0, x1) {
  let lastSup = -99, prevTop = null;
  P.p.forEach((q) => {
    const xi = Math.round(q.x);
    if (xi >= x0 && xi <= x1 && xi - lastSup >= 12) {
      const topY = q.y + 5;
      if (topY < ground - 3) {
        line(c, xi, topY, xi, ground, K.steelD, 2);
        if (prevTop && prevTop.y < ground - 3) { line(c, prevTop.x, prevTop.y + 8, xi, topY + 8, K.steel, 1); line(c, prevTop.x, ground - 2, xi, topY + 8, K.steel, 1); }
        prevTop = { x: xi, y: topY }; lastSup = xi;
      }
    }
  });
  const trace = (off) => {
    c.beginPath();
    P.p.forEach((q, i) => { const X = q.x - Math.sin(q.ang) * off, Y = q.y + Math.cos(q.ang) * off; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); });
  };
  for (let i = 0; i < P.p.length; i += 5) { const q = P.p[i]; line(c, q.x, q.y, q.x - Math.sin(q.ang) * 4, q.y + Math.cos(q.ang) * 4, K.steelD, 0.8); }
  c.lineJoin = 'round'; c.lineCap = 'round';
  trace(4); c.lineWidth = 1.2; c.strokeStyle = K.steelD; c.stroke();
  trace(0); c.lineWidth = 2.8; c.strokeStyle = K.redD; c.stroke();
  trace(0.2); c.lineWidth = 1.8; c.strokeStyle = K.red; c.stroke();
  trace(-0.4); c.lineWidth = 0.6; c.strokeStyle = '#ff9aa2'; c.stroke();
}
function drawCar(c, P, d, scale) {
  const sc = scale || 1;
  for (let w = 0; w < 3; w++) {
    const q = pathAt(P, d - w * 11 * sc), ca = Math.cos(q.ang), sa = Math.sin(q.ang);
    line(c, q.x - ca * 4 * sc, q.y - 5 * sc - sa * 4 * sc, q.x + ca * 4 * sc, q.y - 5 * sc + sa * 4 * sc, w === 0 ? K.yellow : K.blue, Math.round(5 * sc));
    disc(c, q.x - 1, q.y - 9 * sc, Math.max(1, Math.round(2 * sc)), K.skin);
    disc(c, q.x + 2 * sc, q.y - 9 * sc, Math.max(1, Math.round(2 * sc)), K.pink);
    R(c, q.x - 4 * sc, q.y - 2, 2, 2, K.dark); R(c, q.x + 3 * sc, q.y - 2, 2, 2, K.dark);
  }
}
const PARK_COASTER = buildPath([[0, 0], [18, -34], [40, -66], [62, -24], [78, 0], [96, -16], [112, -38], [128, -20], [140, 0]]);

function coasterScenePath(angDeg) {
  const th = (angDeg * Math.PI) / 180, Ls = 120, gy = GROUND - 6, ax = 56;
  const ay = gy - Ls * Math.sin(th), bx = ax + Ls * Math.cos(th);
  const pts = [[6, gy], [ax - 20, ay + (gy - ay) * 0.12], [ax, ay], [bx, gy], [250, gy], [275, gy - 22], [300, gy - 36], [325, gy - 22], [350, gy], [378, gy]];
  const P = buildPath(pts);
  const apex = pathAt(P, 0).d; // placeholder, replaced below
  let dApex = 0;
  for (let i = 0; i < P.p.length; i++) if (Math.abs(P.p[i].x - ax) < 1 && Math.abs(P.p[i].y - ay) < 1) { dApex = P.p[i].d; break; }
  return { P, Ls, dApex, apex, ax, ay, bx, gy };
}

RIDES.coaster = {
  id: 'coaster', name: 'Roller Coaster', cycle: 6, outT: [0],
  blurb: 'The car rolls down the big drop. Leave a blank and gravity sets it: a = g(sin θ − μ cos θ). Give 2 more measurements.',
  fields: [
    { k: 'ang', label: 'Slope angle θ', unit: '°', def: '40' }, { k: 'mu', label: 'Track friction μ', unit: '', def: '0' },
    { k: 's', label: 'Displacement Δx', unit: 'm' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final velocity Vf', unit: 'm/s' }, { k: 'a', label: 'Acceleration a', unit: 'm/s²', ph: 'auto from slope' },
    { k: 'u', label: 'Initial velocity Vi', unit: 'm/s' },
  ],
  example: { ang: '40', mu: '0.05', u: '2', s: '60' },
  box: { x0: -2, y0: -70, x1: 142, y1: 3 },
  park(c, x, y, t) {
    c.save(); c.translate(Math.round(x), Math.round(y));
    drawTrack(c, PARK_COASTER, 0, -2, 142);
    drawCar(c, PARK_COASTER, (t * 26) % PARK_COASTER.len, 0.8);
    c.restore();
  },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['V', '0.0', 'm/s', K.green], ['Δx', '0.0', 'm', K.ink]];
    const d = st.data;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['V', fix(kinV(d, st.tau), 1), 'm/s', K.green], ['Δx', fix(kinS(d, st.tau), 1), 'm', K.ink]];
  },
  scene(c, st, now) {
    const ang = st ? st.data.ang : 40, S = coasterScenePath(ang);
    drawTrack(c, S.P, GROUND, 6, 378);
    let d;
    if (!st) d = (now * 34) % S.P.len;
    else {
      const sPx = (kinS(st.data, st.tau) / st.data.s) * S.Ls;
      d = S.dApex + sPx + (st.after ? 150 * (1 - Math.pow(1 - Math.min(1, st.after / 2), 2)) : 0);
    }
    drawCar(c, S.P, d, 1);
    // slope angle marker at the bottom of the drop
    if (st) {
      line(c, S.bx - 26, S.gy, S.bx, S.gy, K.white, 1);
      ptxt(c, `${fix(ang, 0)}°`, S.bx - 44, S.gy - 12, K.white, 8);
    }
  },
};

/* ---------- Cannon ---------- */
const CPX = 3, COX = 38; // pixels per metre, launch x
function drawCannon(c, ang, h0, firedFlash) {
  const ground = GROUND, my = ground - h0 * CPX - 4, th = (ang * Math.PI) / 180, bl = 24;
  const px = COX - Math.cos(th) * bl, py = my + Math.sin(th) * bl;
  if (h0 > 0) { R(c, COX - 22, my + 6, 26, ground - my - 6, K.brown); for (let y = my + 10; y < ground; y += 6) R(c, COX - 22, y, 26, 1, K.brownD); }
  line(c, px, py, COX, my, K.dark, 10);
  line(c, px, py, COX, my, K.steelD, 7);
  line(c, px - 1, py - 2, COX - 1, my - 2, K.steel, 2);
  disc(c, COX - 12, my + 8, 8, K.brownD, true); disc(c, COX - 12, my + 8, 6, K.brown, true); disc(c, COX - 12, my + 8, 2, K.yellow);
  if (firedFlash) { disc(c, COX + 6, my, 6, K.yellow); disc(c, COX + 6, my, 3, K.white); }
}
function drawTargetPost(c, D) {
  const x = Math.round(COX + D * CPX), g = GROUND;
  R(c, x - 12, g - 2, 24, 3, K.green);                     // landing zone ±4 m
  R(c, x - 1, g - 26, 3, 26, K.brownD);
  [[9, K.white], [7, K.red], [5, K.white], [3, K.red], [1, K.white]].forEach(([rd, k]) => disc(c, x, g - 30, rd, k, true));
}

RIDES.cannon = {
  id: 'cannon', name: 'Cannon Game', cycle: 3, outT: [0],
  blurb: 'Hit the bullseye! Give the launch speed v₀ and angle, or give the target range and let me find v₀.',
  target: 60,
  fields: [
    { k: 'rng', label: 'Range (target)', unit: 'm', def: '60' },
    { k: 'ang', label: 'Cannon angle θ', unit: '°', def: '45' }, { k: 'h0', label: 'Launch height h₀', unit: 'm', def: '0' },
    { k: 'v0', label: 'Initial velocity Vi', unit: 'm/s' },
  ],
  example: { ang: '45', h0: '0' },
  box: { x0: -28, y0: -34, x1: 26, y1: 3 },
  park(c, x, y, t) {
    R(c, x - 22, y - 12, 44, 14, K.red);
    for (let i = 0; i < 44; i += 8) R(c, x - 22 + i, y - 12, 4, 14, K.white);
    R(c, x - 24, y - 16, 48, 5, K.blue);
    for (let i = 0; i < 48; i += 8) R(c, x - 24 + i, y - 16, 4, 5, K.white);
    line(c, x - 6, y - 20, x + 10, y - 28, K.dark, 7); line(c, x - 6, y - 20, x + 10, y - 28, K.steelD, 4);
    disc(c, x - 8, y - 18, 5, K.brown);
    disc(c, x + 20, y - 26, 5, K.white, true); disc(c, x + 20, y - 26, 3, K.red, true); disc(c, x + 20, y - 26, 1, K.white, true);
    R(c, x + 19, y - 21, 2, 9, K.brownD);
  },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['x', '0.0', 'm', K.ink], ['v', '0.0', 'm/s', K.green]];
    const tr = st.data.tr, tau = Math.min(st.tau, tr.T);
    return [['t', fix(tau, 1), 's', K.yellow], ['x', fix(tr.vx * tau, 1), 'm', K.ink], ['v', fix(Math.hypot(tr.vx, tr.vy - G * tau), 1), 'm/s', K.green]];
  },
  scene(c, st, now) {
    const D = RIDES.cannon.target;
    for (let m = 0; m <= 110; m += 10) {
      const x = COX + m * CPX; R(c, x, GROUND + 1, 1, 4, K.ink);
      if (m % 20 === 0) ptxt(c, String(m), x, GROUND + 7, K.ink, 8, 'center');
    }
    drawTargetPost(c, D);
    const ang = st ? st.data.ang : RIDES.cannon.angPreview || 45, h0 = st ? st.data.h0 : 0;
    drawCannon(c, ang, h0, st && st.tau < 0.15);
    if (!st) { ptxt(c, `TARGET ${D} m`, W - 8, 8, K.yellow, 8, 'right'); return; }
    const tr = st.data.tr, tau = Math.min(st.tau, tr.T);
    for (let q = 0; q <= tau; q += 0.1) disc(c, COX + tr.vx * q * CPX, GROUND - (st.data.h0 + tr.vy * q - 0.5 * G * q * q) * CPX, 1, K.white, true);
    const bx = COX + tr.vx * tau * CPX, by = GROUND - (st.data.h0 + tr.vy * tau - 0.5 * G * tau * tau) * CPX;
    if (bx < W + 6 && by > -6) { disc(c, bx, by, 3, K.steelD); disc(c, bx - 1, by - 1, 1, K.steel, true); }
    else ptxt(c, 'OUT OF VIEW', W - 6, 70, K.red, 8, 'right');
    if (st.done) {
      const hit = Math.abs(tr.range - D) <= 4;
      ptxt(c, hit ? 'BULLSEYE!' : `LANDED ${fix(tr.range, 1)} m`, W / 2, 56, hit ? K.green : K.red, 10, 'center');
    }
    ptxt(c, `TARGET ${D} m`, W - 8, 8, K.yellow, 8, 'right');
  },
};

/* ===== Rides part 2: drop tower, carousel, pirate ship ===== */

/* ---------- Drop tower ---------- */
function drawDrop(c, cx, by, Ht, cy) {
  const top = by - Ht;
  R(c, cx - 18, by - 3, 36, 4, K.steelD);
  R(c, cx - 5, top, 3, Ht, K.steel); R(c, cx + 3, top, 3, Ht, K.steel);
  for (let y = top; y < by - 4; y += 7) { line(c, cx - 2, y, cx + 3, y + 7, K.steelD, 1); line(c, cx + 3, y, cx - 2, y + 7, K.steelD, 1); }
  R(c, cx - 12, top - 8, 24, 8, K.red); R(c, cx - 14, top - 10, 28, 3, K.yellow);
  for (let i = 0; i < 24; i += 6) R(c, cx - 12 + i, top - 8, 3, 8, K.white);
  R(c, cx, top - 20, 1, 10, K.white); R(c, cx + 1, top - 20, 7, 4, K.pink);
  // carriage with four riders
  R(c, cx - 15, cy, 30, 4, K.yellow); R(c, cx - 15, cy + 4, 30, 1, K.orange);
  [-12, -8, 8, 12].forEach((dx, i) => {
    const col = [K.blue, K.green, K.pink, K.purple][i];
    R(c, cx + dx - 1, cy + 6, 3, 4, col); disc(c, cx + dx, cy + 5, 1, K.skin);
    R(c, cx + dx - 1, cy + 10, 1, 3, K.dark); R(c, cx + dx + 1, cy + 10, 1, 3, K.dark);
  });
}

RIDES.drop = {
  id: 'drop', name: 'Drop Tower', cycle: 7, outT: [5],
  blurb: 'Free fall! The carriage drops straight down. Gravity is a = 9.8 m/s², but change it to see braking. Give 3 of 5.',
  fields: [
    { k: 's', label: 'Displacement Δx', unit: 'm' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final velocity Vf', unit: 'm/s' }, { k: 'a', label: 'Acceleration a', unit: 'm/s²', def: '9.8' },
    { k: 'u', label: 'Initial velocity Vi', unit: 'm/s', def: '0' },
  ],
  example: { t: '3' },
  box: { x0: -18, y0: -112, x1: 18, y1: 3 },
  park(c, x, y, t) {
    const Ht = 90, top = y - Ht, ph = t % 7;
    let cy;
    if (ph < 4) cy = y - 12 - (ph / 4) * (Ht - 18);
    else if (ph < 4.9) cy = top + 6 + Math.pow((ph - 4) / 0.9, 2) * (Ht - 18);
    else cy = y - 12;
    if (ph >= 4 && ph < 4.9) cy = Math.min(cy, y - 12);
    drawDrop(c, x, y, Ht, Math.round(cy));
  },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['V', '0.0', 'm/s', K.green], ['Δx', '0.0', 'm', K.ink]];
    const d = st.data;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['V', fix(kinV(d, st.tau), 1), 'm/s', K.green], ['Δx', fix(kinS(d, st.tau), 1), 'm', K.ink]];
  },
  scene(c, st, now) {
    const cx = 150, by = GROUND - 2, Ht = 140, top = by - Ht, Hm = st ? Math.max(st.data.s, 1) : 50, ppm = (Ht - 16) / Hm;
    let fall = st ? clamp(kinS(st.data, st.tau), 0, Hm) : 2 + 2 * Math.sin(now * 1.5);
    drawDrop(c, cx, by, Ht, Math.round(top + 6 + fall * ppm));
    const step = Hm > 80 ? 20 : Hm > 30 ? 10 : Hm > 12 ? 5 : 2;
    R(c, cx + 34, top + 6, 1, Hm * ppm, K.ink);
    for (let m = 0; m <= Hm + 0.001; m += step) {
      const y = Math.round(top + 6 + m * ppm);
      R(c, cx + 31, y, 8, 1, K.ink);
      ptxt(c, `${fix(Hm - m, 0)} m`, cx + 42, y - 4, K.ink, 8);
    }
    if (st) ptxt(c, `fallen ${fix(fall, 1)} m`, W - 8, 8, K.pink, 8, 'right');
  },
};

/* ---------- Carousel ---------- */
function ellipse(c, cx, cy, rx, ry, col) {
  c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, Math.max(0.5, rx + 0.5), Math.max(0.5, ry + 0.5), 0, 0, TAU); c.fill();
}
function arrowPx(c, x, y, dx, dy, col) {
  const len = Math.hypot(dx, dy); if (len < 3) return;
  const ux = dx / len, uy = dy / len, ex = x + dx, ey = y + dy;
  line(c, x, y, ex, ey, col, 2);
  line(c, ex, ey, ex - ux * 6 - uy * 4, ey - uy * 6 + ux * 4, col, 2);
  line(c, ex, ey, ex - ux * 6 + uy * 4, ey - uy * 6 - ux * 4, col, 2);
}
function drawCarousel(c, cx, by, sc, phi, vectors) {
  const rx = Math.round(78 * sc), ry = Math.round(16 * sc), poleTop = by - Math.round(88 * sc);
  ellipse(c, cx, by, rx + 3, ry + 3, '#3a2b6b'); ellipse(c, cx, by - 3, rx, ry, K.brown);
  ellipse(c, cx, by - 3, rx - 4, ry - 2, K.pink); ellipse(c, cx, by - 3, Math.round(rx * 0.7), Math.round(ry * 0.7), K.yellow);
  const pw = Math.max(3, Math.round(5 * sc));
  R(c, cx - pw, poleTop, pw * 2, by - 3 - poleTop, K.steel);
  for (let y = poleTop; y < by - 4; y += 6) R(c, cx - pw, y, pw * 2, 2, K.white);
  // horses (back first)
  const n = 8, Rh = Math.round(52 * sc), hs = [];
  for (let i = 0; i < n; i++) { const a = phi + (i * TAU) / n; hs.push({ i, a, s: Math.sin(a) }); }
  hs.sort((p, q) => p.s - q.s);
  const cols = [K.white, K.pink, K.yellow, K.blue];
  hs.forEach((h) => {
    const hx = cx + Rh * Math.cos(h.a), gy = by - 3 + Math.round((Rh / rx) * ry * h.s);
    const bob = Math.round(4 * sc * Math.sin(phi * 3 + h.i * 1.7)), hy = gy - Math.round(16 * sc) + bob, dir = h.s > 0 ? -1 : 1;
    line(c, hx, poleTop + 4, hx, hy, K.yellow, 1);
    const col = cols[h.i % 4], u = Math.max(1, sc * 1.2);
    shadowEl(c, hx, gy + 1, 6 * u, 1.6 * u, 0.25);
    [-4, 3.2].forEach((lx) => line(c, hx + lx * u, hy + 4 * u, hx + lx * u, hy + 8 * u, K.brownD, 1.6 * u));
    line(c, hx - dir * 5 * u, hy + 0.5 * u, hx - dir * 7.2 * u, hy + 4.5 * u, K.brownD, 1.6 * u);
    ellipse(c, hx, hy + 2.5 * u, 5.4 * u, 3 * u, col);
    line(c, hx + dir * 3.5 * u, hy + 1 * u, hx + dir * 5.5 * u, hy - 3 * u, col, 3 * u);
    ellipse(c, hx + dir * 6.6 * u, hy - 3.4 * u, 2 * u, 1.4 * u, col);
    line(c, hx + dir * 3.2 * u, hy - 0.5 * u, hx + dir * 5 * u, hy - 4 * u, K.brownD, 1 * u);
    disc(c, hx + dir * 7.1 * u, hy - 3.9 * u, 0.5, K.dark, true);
    rr(c, hx - 1.6 * u, hy - 0.4 * u, 3.2 * u, 1.8 * u, 0.8 * u, K.red);
    rr(c, hx - 1.3 * u, hy - 4.2 * u, 2.8 * u, 4.2 * u, 1 * u, [K.red, K.blue, K.green, K.purple][h.i % 4]);
    disc(c, hx, hy - 5.8 * u, 1.5 * u, K.skin);
    if (h.i === 0 && vectors) {
      // tangential velocity (cyan) and centripetal acceleration (red) on the first rider
      const tx = -Math.sin(h.a), ty = Math.cos(h.a) * (ry / rx);
      arrowPx(c, hx, hy - 6 * u, tx * 30, ty * 30, K.cyan || '#59e0d0');
      arrowPx(c, hx, hy - 6 * u, (cx - hx) * 0.5, (poleTop + 4 - hy + 6 * u) * 0.0, K.red);
      disc(c, hx, hy - 6 * u, Math.max(2, Math.round(2 * u)), K.white); disc(c, hx, hy - 6 * u, 1, K.red);
    }
  });
  // roof
  const roofH = Math.round(30 * sc), roofW = rx + 8, stripe = Math.max(6, Math.round(10 * sc));
  c.save();
  c.beginPath(); c.moveTo(cx, poleTop - roofH); c.lineTo(cx + roofW, poleTop); c.lineTo(cx - roofW, poleTop); c.closePath(); c.clip();
  for (let sI = -10; sI <= 10; sI++) { c.fillStyle = sI % 2 ? K.white : K.red; c.fillRect(cx + sI * stripe, poleTop - roofH - 1, stripe + 0.3, roofH + 2); }
  const rg = c.createLinearGradient(cx - roofW, 0, cx + roofW, 0);
  rg.addColorStop(0, 'rgba(255,255,255,0.28)'); rg.addColorStop(0.45, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(10,0,40,0.35)');
  c.fillStyle = rg; c.fillRect(cx - roofW, poleTop - roofH - 1, roofW * 2, roofH + 2);
  c.restore();
  for (let x = -roofW; x <= roofW; x += 8) disc(c, cx + x, poleTop + 2, 3, Math.abs(x / 8) % 2 ? K.yellow : K.pink);
  R(c, cx, poleTop - roofH - 10, 1, 10, K.white); R(c, cx + 1, poleTop - roofH - 10, 7, 4, K.yellow);
}

RIDES.carousel = {
  id: 'carousel', name: 'Carousel', cycle: 6, outT: [0, 3],
  blurb: 'Round and round at steady speed. Give the radius and any one of period T, spin speed ω or rim speed v.',
  fields: [
    { k: 'r', label: 'Horse ring radius r', unit: 'm', def: '6' }, { k: 'T', label: 'Time for one turn T', unit: 's' },
    { k: 'w', label: 'Spin speed ω', unit: 'rad/s' }, { k: 'v', label: 'Rim velocity v', unit: 'm/s' },
    { k: 't', label: 'Ride time t', unit: 's' }, { k: 'm', label: 'Rider mass m', unit: 'kg', def: '40' },
  ],
  example: { r: '6', T: '8', t: '20' },
  box: { x0: -54, y0: -80, x1: 54, y1: 4 },
  park(c, x, y, t) { drawCarousel(c, x, y, 0.55, t * 0.7); },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['V', '0.0', 'm/s', K.green], ['Δx', '0.0', 'm', K.ink]];
    const v = st.data.w * st.data.r;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['V', fix(v, 1), 'm/s', K.green], ['Δx', fix(v * st.tau, 1), 'm', K.ink]];
  },
  scene(c, st, now) {
    drawCarousel(c, 192, GROUND - 4, 1.3, st ? st.data.w * st.tau : now * 0.6, !!st);
    if (st) ptxt(c, `ω ${fix(st.data.w, 2)} rad/s`, W - 8, 8, K.pink, 8, 'right');
  },
};

/* ---------- Pirate ship ---------- */
function drawPirate(c, cx, by, sc, th, th0, st) {
  const pivotY = by - Math.round(130 * sc), arm = Math.round(100 * sc), hw = Math.round(34 * sc);
  line(c, cx - 4 * sc, pivotY, cx - 50 * sc, by, K.steelD, Math.max(2, Math.round(3 * sc)));
  line(c, cx + 4 * sc, pivotY, cx + 50 * sc, by, K.steelD, Math.max(2, Math.round(3 * sc)));
  const bf = 0.6; line(c, cx - 4 * sc - 46 * sc * bf, pivotY + (by - pivotY) * bf, cx + 4 * sc + 46 * sc * bf, pivotY + (by - pivotY) * bf, K.steel, 1);
  R(c, cx - 56 * sc, by - 3, 112 * sc, 4, K.steelD);
  R(c, cx - 9 * sc, pivotY - 4, 18 * sc, 7, K.red);
  if (th0) { // guide marks at the highest swing points
    [-1, 1].forEach((sg) => {
      for (let d = 12; d < arm + 4; d += 8) R(c, cx + Math.sin(sg * th0) * d, pivotY + Math.cos(sg * th0) * d, 1, 1, K.white);
    });
  }
  const sx = cx + arm * Math.sin(th), sy = pivotY + arm * Math.cos(th), ca = Math.cos(th), sa = Math.sin(th);
  line(c, cx, pivotY, sx, sy, K.steel, 2);
  disc(c, cx, pivotY, Math.max(2, Math.round(3 * sc)), K.yellow);
  const hullH = Math.max(4, Math.round(7 * sc));
  const topE = [], botE = [];
  for (let i = -hw; i <= hw; i += 2) {
    const yl = -9 * sc * (i / hw) * (i / hw) + 4 * sc;
    const X = sx + i * ca + yl * sa, Y = sy - i * sa + yl * ca;
    topE.push([X, Y]); botE.push([X, Y + hullH]);
  }
  const hg = c.createLinearGradient(0, sy - 6 * sc, 0, sy + hullH + 12 * sc);
  hg.addColorStop(0, K.red); hg.addColorStop(1, K.redD);
  c.fillStyle = hg; c.beginPath();
  topE.forEach(([X, Y], k) => { if (k) c.lineTo(X, Y); else c.moveTo(X, Y); });
  botE.slice().reverse().forEach(([X, Y]) => c.lineTo(X, Y));
  c.closePath(); c.fill();
  c.beginPath(); topE.forEach(([X, Y], k) => { if (k) c.lineTo(X, Y); else c.moveTo(X, Y); });
  c.lineWidth = 1.2; c.strokeStyle = K.white; c.stroke();
  for (let i = -3; i <= 3; i += 2) {
    const il = (i * hw) / 4, yl = -9 * sc * (il / hw) * (il / hw) + 4 * sc + hullH * 0.55;
    disc(c, sx + il * ca + yl * sa, sy - il * sa + yl * ca, Math.max(1, sc * 1.1), K.yellow, true);
  }
  const cols = [K.blue, K.green, K.pink, K.yellow, K.purple];
  for (let i = -3; i <= 3; i++) {
    const il = (i * hw) / 4, yl = -9 * sc * (il / hw) * (il / hw) + 4 * sc - 4 * sc;
    const X = sx + il * ca + yl * sa, Y = sy - il * sa + yl * ca;
    R(c, X - 1, Y - 3, 3, 3, cols[(i + 3) % 5]); disc(c, X, Y - 5, Math.max(1, Math.round(1.6 * sc)), K.skin);
  }
  return { sx, sy };
}

RIDES.pirate = {
  id: 'pirate', name: 'Pirate Ship', cycle: 5, outT: [0, 1.12, 2.24],
  blurb: 'A swinging pendulum. Give the arm length L and the release angle. Add a time t to see where the ship is then.',
  fields: [
    { k: 'L', label: 'Arm length L', unit: 'm', def: '12' }, { k: 'ang', label: 'Release angle θ₀', unit: '°', def: '40' },
    { k: 't', label: 'Check at time t', unit: 's' },
  ],
  example: { L: '12', ang: '40', t: '2' },
  box: { x0: -58, y0: -72, x1: 58, y1: 3 },
  park(c, x, y, t) { drawPirate(c, x, y, 0.5, 0.85 * Math.cos(t * 1.4)); },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['θ', '0', '°', K.green], ['v', '0.0', 'm/s', K.ink]];
    const d = st.data, ph = (TAU * st.tau) / d.Tc;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['θ', fix(((d.th0 * Math.cos(ph)) * 180) / Math.PI, 0), '°', K.green],
      ['v', fix(d.L * d.th0 * (TAU / d.Tc) * Math.abs(Math.sin(ph)), 1), 'm/s', K.ink]];
  },
  scene(c, st, now) {
    const th = st ? st.data.th0 * Math.cos((TAU * st.tau) / st.data.Tc) : 0.7 * Math.cos(now * 1.2);
    drawPirate(c, 192, GROUND - 2, 1.0, th, st ? st.data.th0 : 0.7, st);
  },
};

RIDES.cannon.angPreview = 45;
const RIDE_ORDER = ['ferris', 'coaster', 'cannon', 'drop', 'carousel', 'pirate'];

/* ===== World: crowd, scenery, park layout, menu scene ===== */
const _tintCache = {};
function tint(hex, f, to) {
  const key = hex + f + to;
  if (_tintCache[key]) return _tintCache[key];
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const m = (s) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
  return (_tintCache[key] = `rgb(${m(16)},${m(8)},${m(0)})`);
}

/* ---------- crowd ---------- */
const SHIRTS = [K.red, K.blue, K.green, K.yellow, K.pink, K.purple, K.orange, '#ffffff', '#35c6c6'];
const PANTS = ['#2b2d6b', '#3b3b3b', '#5e3b1e', '#1f4e79', '#6b2b4a', '#2f5d34'];
const HAIRS = ['#2a1a0a', '#6b3a12', '#e8c35a', '#111111', '#b0451d', '#9a9a9a'];
const SKINS = [K.skin, K.skinD, '#a8714a', '#7a4b2a'];

function makeCrowd(n, b) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const p = { b, x: rnd(b.x0, b.x1), y: rnd(b.y0, b.y1), tx: 0, ty: 0, speed: rnd(7, 16), pause: rnd(0, 2), phase: rnd(0, 10),
      shirt: pick(SHIRTS), pants: pick(PANTS), hair: pick(HAIRS), skin: pick(SKINS), kid: Math.random() < 0.22,
      balloon: Math.random() < 0.16 ? pick([K.red, K.blue, K.yellow, K.pink, K.green]) : null, hat: Math.random() < 0.18 ? pick([K.red, K.blue, K.yellow]) : null, dir: 1 };
    pickTarget(p); list.push(p);
  }
  return list;
}
function pickTarget(p) {
  const b = p.b;
  p.tx = clamp(p.x + rnd(-110, 110), b.x0, b.x1);
  p.ty = rnd(b.y0, b.y1);
  p.dir = p.tx >= p.x ? 1 : -1;
}
function stepCrowd(list, dt) {
  list.forEach((p) => {
    if (p.pause > 0) { p.pause -= dt; return; }
    const dx = p.tx - p.x, dy = p.ty - p.y;
    if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) { p.pause = Math.random() < 0.5 ? rnd(0.6, 3) : 0; pickTarget(p); return; }
    p.dir = dx >= 0 ? 1 : -1;
    if (Math.abs(dx) > 1.5) p.x += Math.sign(dx) * p.speed * dt;
    if (Math.abs(dy) > 1.5) p.y += Math.sign(dy) * p.speed * 0.35 * dt;
  });
}
function drawCrowd(c, list, t, night) {
  const col = (h) => (night ? tint(h, 0.5, '#1b1033') : h);
  list.slice().sort((a, b) => a.y - b.y).forEach((p) => {
    const x = p.x, y = p.y, kid = p.kid, k = kid ? 0.78 : 1;
    const ph = p.pause <= 0 ? Math.sin(t * 9 + p.phase) : 0;
    const lh = 5 * k, th = 5.5 * k, bw = 5.6 * k, ty = y - lh - th;
    shadowEl(c, x, y, 4.2 * k, 1.3, 0.25);
    line(c, x - 1.1 * k, y - lh, x - 1.1 * k + ph * 1.4, y - 0.4, col(p.pants), 1.9 * k);
    line(c, x + 1.1 * k, y - lh, x + 1.1 * k - ph * 1.4, y - 0.4, col(p.pants), 1.9 * k);
    rr(c, x - bw / 2, ty, bw, th + 0.8, 1.6 * k, col(p.shirt));
    line(c, x - bw / 2, ty + 1, x - bw / 2 - 0.5 - ph * 0.8, ty + th * 0.8, col(p.skin), 1.3);
    line(c, x + bw / 2, ty + 1, x + bw / 2 + 0.5 + ph * 0.8, ty + th * 0.8, col(p.skin), 1.3);
    disc(c, x, ty - 2.4 * k, 2.6 * k, col(p.skin));
    c.fillStyle = col(p.hair); c.beginPath(); c.arc(x, ty - 2.4 * k, 2.8 * k, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
    if (p.hat) { rr(c, x - 3.4, ty - 4.8 * k, 6.8, 1.2, 0.6, col(p.hat)); rr(c, x - 2, ty - 6.8 * k, 4, 2.4, 1, col(p.hat)); }
    if (p.balloon) {
      const bx = x + bw / 2 + 1.2, sway = Math.sin(t * 2 + p.phase) * 1.5;
      line(c, bx, ty + th * 0.7, bx + sway, ty - 9, night ? '#6b5fa8' : K.white, 0.5);
      disc(c, bx + sway, ty - 12, 3.4, col(p.balloon));
    }
  });
}

/* ---------- scenery ---------- */
const TUFTS = (() => { let s = 99; const o = []; for (let i = 0; i < 90; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const x = s % W; s = (s * 1103515245 + 12345) & 0x7fffffff; o.push([x, 116 + (s % 58)]); } return o; })();
const CLOUDS = [{ x: 30, y: 22, s: 1 }, { x: 150, y: 40, s: 0.8 }, { x: 250, y: 16, s: 1.2 }, { x: 340, y: 50, s: 0.7 }];
const HORIZON = 112, PATH_Y = 176;

function drawCloud(c, x, y, s) {
  const puff = (dx, dy, r) => {
    const px = x + dx * s, py = y + dy * s, rad = r * s;
    const g = c.createRadialGradient(px - rad * 0.2, py - rad * 0.45, 1, px, py, rad);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#f3faff'); g.addColorStop(1, '#cfe5f6');
    c.fillStyle = g; c.beginPath(); c.arc(px, py, rad, 0, TAU); c.fill();
  };
  c.fillStyle = '#e4f2fc'; c.beginPath(); c.roundRect(x - 6 * s, y + 1 * s, 38 * s, 8 * s, 4 * s); c.fill();
  puff(0, 3, 7); puff(10, -2, 10); puff(21, 1, 8); puff(30, 4, 6);
}
function hillPath(c, base, fn, c0, c1) {
  const g = c.createLinearGradient(0, base - 40, 0, base); g.addColorStop(0, c0); g.addColorStop(1, c1);
  c.fillStyle = g; c.beginPath(); c.moveTo(0, base + 1);
  for (let x = 0; x <= W; x += 2) c.lineTo(x, base - fn(x));
  c.lineTo(W, base + 1); c.closePath(); c.fill();
}
function drawScenery(c, now) {
  const sky = c.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, mixc('#2f8fe8', '#0a1040', nightT)); sky.addColorStop(0.55, mixc('#86cdff', '#232a80', nightT)); sky.addColorStop(1, mixc('#e2f4ff', '#4b4aa0', nightT));
  c.fillStyle = sky; c.fillRect(0, 0, W, HORIZON + 2);
  c.globalAlpha = 1 - nightT; const sg = c.createRadialGradient(334, 34, 2, 334, 34, 64);
  sg.addColorStop(0, 'rgba(255,250,210,0.95)'); sg.addColorStop(0.25, 'rgba(255,240,160,0.55)'); sg.addColorStop(1, 'rgba(255,240,160,0)');
  c.fillStyle = sg; c.fillRect(250, 0, 134, 112);
  c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(334, 34, 11, 0, TAU); c.fill(); c.globalAlpha = 1;
  CLOUDS.forEach((cl) => drawCloud(c, ((cl.x + now * 3 * cl.s) % (W + 60)) - 30, cl.y, cl.s));
  hillPath(c, HORIZON, (x) => 20 + 7 * Math.sin(x * 0.025) + 4 * Math.sin(x * 0.07 + 1), '#8cc2b4', '#5fa87e');
  hillPath(c, HORIZON + 2, (x) => 9 + 4 * Math.sin(x * 0.04 + 2), '#7fd493', '#4fae6b');
  const gr = c.createLinearGradient(0, HORIZON, 0, PATH_Y);
  gr.addColorStop(0, '#6fc872'); gr.addColorStop(1, '#3c9b4c');
  c.fillStyle = gr; c.fillRect(0, HORIZON, W, PATH_Y - HORIZON);
  const hz = c.createLinearGradient(0, HORIZON, 0, HORIZON + 34);
  hz.addColorStop(0, 'rgba(226,244,255,0.55)'); hz.addColorStop(1, 'rgba(226,244,255,0)');
  c.fillStyle = hz; c.fillRect(0, HORIZON, W, 34);
  TUFTS.forEach((t) => { line(c, t[0], t[1], t[0] - 0.6, t[1] - 1.8, K.grassD, 0.6); line(c, t[0] + 1, t[1], t[0] + 1.6, t[1] - 1.5, K.grassD, 0.6); });
  const pg = c.createLinearGradient(0, PATH_Y, 0, H);
  pg.addColorStop(0, '#efd6ab'); pg.addColorStop(1, '#d1ae79');
  c.fillStyle = pg; c.fillRect(0, PATH_Y, W, H - PATH_Y);
  c.fillStyle = 'rgba(120,80,30,0.35)'; c.fillRect(0, PATH_Y - 0.5, W, 1.2);
  c.fillStyle = 'rgba(120,80,30,0.14)';
  for (let y = PATH_Y + 12; y < H; y += 12) c.fillRect(0, y, W, 0.5);
  for (let r = 0, y = PATH_Y; y < H; y += 12, r++) for (let x = (r % 2) * 12; x < W; x += 24) c.fillRect(x, y + 1, 0.5, 11);
}
function tree(c, x, y, s) {
  s = s || 1;
  shadowEl(c, x + 5 * s, y + 1, 13 * s, 3 * s, 0.22);
  R(c, x - 2 * s, y - 12 * s, 4 * s, 12 * s, K.brown);
  disc(c, x, y - 18 * s, 9 * s, K.greenD); disc(c, x - 2 * s, y - 20 * s, 7 * s, K.green); disc(c, x + 5 * s, y - 15 * s, 5 * s, K.green);
}
function lamp(c, x, y, now, night) {
  R(c, x - 1, y - 30, 2, 30, K.steelD); R(c, x - 3, y - 33, 6, 4, K.steel);
  { const lg = c.createRadialGradient(x, y - 36, 1, x, y - 36, 12); lg.addColorStop(0, 'rgba(255,230,120,0.6)'); lg.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = lg; c.fillRect(x - 12, y - 48, 24, 24); }
  disc(c, x, y - 36, 3, night || Math.floor(now * 2 + x) % 5 ? K.yellow : K.white);
}
function ticketBooth(c, x, y) {
  R(c, x - 15, y - 22, 30, 22, K.red);
  for (let i = 0; i < 30; i += 6) R(c, x - 15 + i, y - 22, 3, 22, K.white);
  R(c, x - 8, y - 17, 16, 9, K.dark); R(c, x - 7, y - 16, 14, 7, K.yellow);
  R(c, x - 18, y - 28, 36, 7, K.blue);
  for (let i = 0; i < 36; i += 6) R(c, x - 18 + i, y - 28, 3, 7, K.white);
  txt(c, 'TICKETS', x, y - 37, K.dark, 6, 'center', false);
  txt(c, 'TICKETS', x, y - 38, K.yellow, 6, 'center', false);
}

/* ---------- park layout ---------- */
const PARK_POS = {
  ferris: { x: 62, y: 128 }, drop: { x: 138, y: 128 }, coaster: { x: 198, y: 130 },
  cannon: { x: 42, y: 182 }, carousel: { x: 128, y: 182 }, pirate: { x: 300, y: 182 },
};
const PARK_BACK = ['ferris', 'drop', 'coaster'], PARK_FRONT = ['carousel', 'cannon', 'pirate'];
const OUTLINES = {};

const OUT_PAD = 9;
function initOutlines() {
  RIDE_ORDER.forEach((id) => {
    const r = RIDES[id], b = r.box, w = b.x1 - b.x0 + OUT_PAD * 2, h = b.y1 - b.y0 + OUT_PAD * 2;
    OUTLINES[id] = makeOutline(w, h, (ctx) => {
      (r.outT || [0]).forEach((t) => r.park(ctx, -b.x0 + OUT_PAD, -b.y0 + OUT_PAD, t, false));
    }, 4);
  });
}

const crowds = {
  park: makeCrowd(34, { x0: 8, x1: 376, y0: 188, y1: 211 }),
  menu: makeCrowd(16, { x0: 8, x1: 376, y0: 194, y1: 211 }),
  ride: makeCrowd(8, { x0: 8, x1: 376, y0: 192, y1: 211 }),
};
let clock = 0;
const bursts = [];

const World = {
  update(dt, screen) {
    clock += dt;
    if (crowds[screen]) stepCrowd(crowds[screen], dt);
    if (screen === 'menu') {
      if (Math.random() < dt * 0.5) {
        const x = rnd(40, W - 40), y = rnd(24, 80), col = pick([K.yellow, K.pink, K.green, '#59e0d0', K.orange]);
        const ps = []; for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU, sp = rnd(18, 34); ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
        bursts.push({ ps, col, age: 0 });
      }
      bursts.forEach((b) => { b.age += dt; b.ps.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 24 * dt; p.vx *= 0.985; }); });
      while (bursts.length && bursts[0].age > 1.6) bursts.shift();
    }
  },

  drawMenu(c, now) {
    { const mg = c.createLinearGradient(0, 0, 0, 150); [[0, '#12082a'], [0.25, '#2c1650'], [0.5, '#6a2a7a'], [0.75, '#d04a74'], [0.92, '#ff9a5c'], [1, '#ffc15e']].forEach(([o, k]) => mg.addColorStop(o, k)); c.fillStyle = mg; c.fillRect(0, 0, W, H); }
    STARS.forEach((s, i) => { if (s[1] < 70 && (Math.floor(now * 2 + i) % 7)) R(c, s[0], s[1], 1, 1, K.ink); });
    disc(c, 70, 118, 14, '#ffe08a');
    hillPath(c, 152, (x) => 22 + 8 * Math.sin(x * 0.03) + 5 * Math.sin(x * 0.08), '#4a2672', '#2a1348');
    R(c, 0, 152, W, 24, '#24103f'); R(c, 0, 176, W, 40, '#2c1650');
    for (let y = 188; y < H; y += 12) R(c, 0, y, W, 1, '#3a1f66');
    // rides, then a dusk tint
    c.save(); c.translate(0, 0);
    drawFerris(c, 316, 172, 62, now * 0.28, true);
    c.save(); c.translate(18, 172); drawTrack(c, PARK_COASTER, 0, -2, 142); drawCar(c, PARK_COASTER, (now * 28) % PARK_COASTER.len, 0.8); c.restore();
    drawDrop(c, 238, 172, 92, Math.round(172 - 14 - (Math.abs(Math.sin(now * 0.5))) * 70));
    c.globalAlpha = 0.38; R(c, 0, 0, W, 176, '#1b1033'); c.globalAlpha = 1;
    c.restore();
    // string lights and bunting
    for (let x = 0; x <= W; x += 4) {
      const y = 8 + Math.round(6 * Math.sin((x / W) * Math.PI * 6));
      R(c, x, y, 1, 1, K.ink);
      if (x % 16 === 0) disc(c, x, y + 2.5, 2, (Math.floor(now * 3) + x / 16) % 2 ? K.yellow : K.pink, true);
    }
    for (let x = 6; x < W; x += 24) {
      const y = 28 + Math.round(10 * Math.sin((x / W) * Math.PI * 4));
      const col = [K.red, K.yellow, K.blue, K.green, K.pink][(x / 24) % 5 | 0];
      for (let k = 0; k < 9; k++) R(c, x + k - 0, y + k * 0 + 0, 1, 1, K.ink);
      c.fillStyle = col; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + 8, y + 1); c.lineTo(x + 4, y + 10); c.closePath(); c.fill();
    }
    drawCrowd(c, crowds.menu, clock, true);
    bursts.forEach((b) => { c.globalAlpha = clamp(1.6 - b.age, 0, 1); b.ps.forEach((p) => disc(c, p.x, p.y, 1.2, b.col, true)); c.globalAlpha = 1; });
  },

  drawPark(c, now, hover) {
    drawScenery(c, now);
    tree(c, 8, 130, 1); tree(c, 372, 128, 1.1); tree(c, 176, 126, 0.9);
    const drawRide = (id) => {
      const r = RIDES[id], p = PARK_POS[id], b = r.box;
      shadowEl(c, p.x, p.y + 2, (b.x1 - b.x0) * 0.42, 5, 0.26);
      r.park(c, p.x, p.y, now, nightT > 0.5);
      const pulse = id === hover ? 1 : 0.55 + 0.45 * Math.sin(now * 4 + p.x);
      c.globalAlpha = pulse;
      c.drawImage(OUTLINES[id], p.x + b.x0 - OUT_PAD, p.y + b.y0 - OUT_PAD, b.x1 - b.x0 + OUT_PAD * 2, b.y1 - b.y0 + OUT_PAD * 2);
      c.globalAlpha = 1;
    };
    PARK_BACK.forEach(drawRide);
    ticketBooth(c, 224, 182);
    PARK_FRONT.forEach(drawRide);
    [20, 96, 168, 260, 350].forEach((x) => lamp(c, x, PATH_Y + 2, now, nightT > 0.5));
    drawCrowd(c, crowds.park, clock, false);
    if (hover) {
      const r = RIDES[hover], p = PARK_POS[hover], b = r.box, label = r.name.toUpperCase();
      c.font = FONT(8); const w = Math.ceil(c.measureText(label).width) + 14, lx = clamp(p.x - w / 2, 2, W - w - 2), ly = Math.max(6, p.y + b.y0 - 22 - Math.round(Math.abs(Math.sin(now * 6)) * 3));
      rr(c, lx - 1.5, ly - 1.5, w + 3, 14, 5, K.white); rr(c, lx, ly, w, 11, 4, K.dark);
      txt(c, label, lx + w / 2, ly + 1.2, K.yellow, 8, 'center', false);
    }
  },

  drawRideBackdrop(c, now) {
    drawScenery(c, now);
    treeLine(c, now);
    lamp(c, 22, 180, now, nightT > 0.5); lamp(c, 362, 180, now, nightT > 0.5);
    drawCrowd(c, crowds.ride, clock, false);
  },

  hit(x, y) {
    const order = PARK_FRONT.concat(PARK_BACK);
    for (const id of order) {
      const p = PARK_POS[id], b = RIDES[id].box;
      if (x >= p.x + b.x0 && x <= p.x + b.x1 && y >= p.y + b.y0 && y <= p.y + b.y1) return id;
    }
    return null;
  },
};

/* ===== UI: screens, drawer, simulation, mascot, loop ===== */
const cv = $('cv'), cx = cv.getContext('2d');
cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
let screen = 'menu', cur = null, sim = null, lastRes = null, hover = null, drawerOpen = false;

const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const narrow = () => window.innerWidth < 760;

/* ---------- Pip the clown helper ---------- */
const PIP = [
  '.......PP.......', '......YYYY......', '.....YYYYYY.....', '....ZZZZZZZZ....', '..HHSSSSSSSSHH..', '..HHSKSSSSKSHH..',
  '...HSSSNNSSSH...', '....SSMMMMSS....', '.....SSSSSS.....', '....WWWWWWWW....', '...BBDBBBBDBB...', '..BBBBBBBBBBBB..',
  '..BBDBBBBBBDBB..', '..BBBBBBBBBBBB..', '...BBBBBBBBBB...', '....LL....LL....', '....LL....LL....', '...FFFF..FFFF...', '...FFFF..FFFF...',
];
const PIPPAL = { P: K.pink, Y: K.yellow, Z: K.purple, H: K.orange, S: K.skin, K: K.dark, N: '#ff2e4d', M: '#7a1030', W: K.white, B: K.blue, D: K.yellow, L: '#2a1a5e', F: K.red };
const pipCtx = $('mascot').getContext('2d');
const pip = { text: '', shown: 0, talking: 0, queue: null, tourList: null, tourI: 0 };

function drawPip(t) {
  const c = pipCtx; c.setTransform(8, 0, 0, 8, 0, 0); c.clearRect(0, 0, 16, 19);
  const blink = Math.floor(t * 1.7) % 9 === 0, talk = pip.shown < pip.text.length && Math.floor(t * 9) % 2;
  line(c, 6, 15, 6, 17.2, '#2a1a5e', 2); line(c, 10, 15, 10, 17.2, '#2a1a5e', 2);
  ellipse(c, 5.4, 17.9, 2.2, 0.9, K.red); ellipse(c, 10.6, 17.9, 2.2, 0.9, K.red);
  line(c, 3.8, 10.6, 2.2, 13.2, K.blue, 1.8); line(c, 12.2, 10.6, 13.8, 13.2, K.blue, 1.8);
  disc(c, 2.1, 13.5, 0.9, K.white); disc(c, 13.9, 13.5, 0.9, K.white);
  ellipse(c, 8, 12.3, 4.9, 3.7, K.blue);
  disc(c, 8, 11.2, 0.5, K.yellow, true); disc(c, 8, 13.2, 0.5, K.yellow, true);
  for (let i = 0; i < 7; i++) disc(c, 4.7 + i * 1.1, 9.3, 0.9, K.white);
  disc(c, 3.6, 5.8, 1.8, K.orange); disc(c, 12.4, 5.8, 1.8, K.orange);
  disc(c, 8, 6, 3.6, K.skin);
  c.fillStyle = K.purple; c.beginPath(); c.moveTo(4.5, 3.9); c.lineTo(11.5, 3.9); c.lineTo(8, 0.9); c.closePath(); c.fill();
  c.fillStyle = K.yellow; c.fillRect(4.5, 3.4, 7, 0.7);
  disc(c, 8, 0.9, 0.9, K.pink);
  if (blink) { line(c, 6.1, 5.9, 7.1, 5.9, K.dark, 0.4); line(c, 8.9, 5.9, 9.9, 5.9, K.dark, 0.4); }
  else { disc(c, 6.6, 5.8, 0.45, K.dark, true); disc(c, 9.4, 5.8, 0.45, K.dark, true); }
  c.globalAlpha = 0.35; disc(c, 5.4, 7.2, 0.8, K.pink, true); disc(c, 10.6, 7.2, 0.8, K.pink, true); c.globalAlpha = 1;
  disc(c, 8, 6.9, 0.9, '#ff2e4d');
  if (talk) ellipse(c, 8, 8.5, 1.1, 0.8, '#7a1030');
  else { c.beginPath(); c.arc(8, 7.5, 1.5, Math.PI * 0.15, Math.PI * 0.85); c.lineWidth = 0.35; c.strokeStyle = '#7a1030'; c.stroke(); }
}
function say(text, opts) {
  opts = opts || {};
  pip.text = text; pip.shown = 0;
  $('srSay').textContent = text;
  $('bubNext').hidden = !opts.next;
  $('bubNext').textContent = opts.last ? 'Got it' : 'Next';
}
function tour(list) {
  pip.tourList = list; pip.tourI = 0;
  say(list[0], { next: true, last: list.length === 1 });
}
$('bubNext').addEventListener('click', () => {
  Snd.sfx('click');
  if (!pip.tourList) return;
  pip.tourI++;
  if (pip.tourI >= pip.tourList.length) { pip.tourList = null; $('bubNext').hidden = true; if (screen === 'ride') say('Open the bar, fill in what you know, then press the big button!'); else say('Tap any ride that has a white outline.'); return; }
  say(pip.tourList[pip.tourI], { next: true, last: pip.tourI === pip.tourList.length - 1 });
  if (screen === 'ride' && /arrow/i.test(pip.tourList[pip.tourI])) pulseTab(true);
});
$('helpBtn').addEventListener('click', () => {
  Snd.sfx('click');
  if (screen === 'ride') tour(rideTour(cur)); else tour(PARK_TOUR);
});
const PARK_TOUR = [
  "Hi, I'm Pip! Welcome to Amuse Me Physics. This park is full of rides that hide real physics.",
  'Every ride with a white outline can be clicked. Try one!',
  'You can also use the ride buttons under the picture.',
];
function rideTour(id) {
  const r = RIDES[id];
  return [
    `This is the ${r.name}. ${r.blurb}`,
    'First, tap the yellow arrow tab on the right side of the screen to open the measurement bar.',
    'Type the numbers you know. Leave the ones you want me to find empty. A yellow answer means I solved it.',
    'Press AMUSE ME PHYSICS. I will calculate everything and the ride will move.',
    'Do not want to see the numbers? Tap the arrow again and the bar slides to the side.',
  ];
}

/* ---------- screens ---------- */
function setScreen(next, rideId) {
  screen = next; cur = rideId || null; sim = null; lastRes = null; hover = null;
  $('app').dataset.screen = next;
  $('menu').hidden = next !== 'menu';
  $('topbar').hidden = next === 'menu';
  $('help').hidden = next === 'menu';
  $('rideList').hidden = next !== 'park';
  $('readout').hidden = next !== 'ride';
  $('drawer').hidden = next !== 'ride';
  $('screenTitle').textContent = next === 'park' ? 'Amusement Park' : next === 'ride' ? RIDES[cur].name : '';
  $('backBtn').textContent = next === 'ride' ? '‹ Park' : '‹ Menu';
  cv.style.cursor = 'default';
  Snd.level(next === 'ride' ? 0.03 : 0.055);
  setDrawer(false); pulseTab(false);
  if (next === 'ride') {
    buildDrawer(cur);
    buildReadout();
    const seen = lsGet('amuse.rideTour');
    if (!seen) { tour(rideTour(cur)); lsSet('amuse.rideTour', '1'); }
    else say(`The ${RIDES[cur].name}! ${RIDES[cur].blurb}`);
    if (!seen) pulseTab(true);
  } else if (next === 'park') {
    if (!lsGet('amuse.parkTour')) { tour(PARK_TOUR); lsSet('amuse.parkTour', '1'); }
    else say('Welcome back! Pick a ride with a white outline.');
  }
}
$('startBtn').addEventListener('click', () => { Snd.start(); if (!Save.customized) { Snd.sfx('click'); openChar(true); return; } Snd.sfx('bell'); balloonTransition(() => setScreen('park')); });
$('backBtn').addEventListener('click', () => { Snd.sfx('click'); setScreen(screen === 'ride' ? 'park' : 'menu'); });
$('soundBtn').addEventListener('click', () => {
  Snd.start(); const on = Snd.toggle();
  $('soundBtn').textContent = on ? 'Sound on' : 'Sound off';
  $('soundBtn').setAttribute('aria-pressed', String(on));
});

/* park picking */
function canvasXY(e) { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; }
cv.addEventListener('pointermove', (e) => {
  if (screen !== 'park') return;
  const [x, y] = canvasXY(e); hover = World.hit(x, y); cv.style.cursor = hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (screen !== 'park') return;
  const [x, y] = canvasXY(e), id = World.hit(x, y);
  if (id) { Snd.sfx('pick'); setScreen('ride', id); }
});
$('rideList').innerHTML = '<span class="rl">Rides:</span>' + RIDE_ORDER.map((id) => `<button class="btn rb" data-ride="${id}">${esc(RIDES[id].name)}</button>`).join('');
$('rideList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ride]'); if (b) { Snd.start(); Snd.sfx('pick'); setScreen('ride', b.dataset.ride); }
});

/* ---------- drawer ---------- */
function pulseTab(on) { $('drawerTab').classList.toggle('pulse', !!on); }
function setDrawer(open) {
  drawerOpen = open;
  $('app').classList.toggle('drawer-open', open);
  $('drawer').classList.toggle('open', open);
  $('drawerTab').setAttribute('aria-expanded', String(open));
  $('drawerTab').setAttribute('aria-label', open ? 'Hide the measurement bar' : 'Show the measurement bar');
  if (open) pulseTab(false);
}
$('drawerTab').addEventListener('click', () => { Snd.sfx('click'); setDrawer(!drawerOpen); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawerOpen) setDrawer(false); });

function buildDrawer(id) {
  const r = RIDES[id];
  $('dTitle').textContent = r.name;
  $('dBlurb').textContent = r.blurb;
  if (id === 'cannon') r.fields[0].def = String(r.target);
  $('dFields').innerHTML = r.fields.map((f) =>
    `<label class="fld" for="f_${f.k}"><span class="fl">${esc(f.label)} <i>${esc(f.unit)}</i></span>` +
    `<input id="f_${f.k}" inputmode="decimal" autocomplete="off" placeholder="${esc(f.ph || '?')}" value="${esc(f.def || '')}"></label>`).join('');
  $('dExtra').innerHTML = id === 'cannon' ? '<button class="btn" id="newTarget">New target</button>' : '';
  if (id === 'cannon') {
    $('newTarget').addEventListener('click', () => {
      r.target = 5 * ri(5, 19); r.fields[0].def = String(r.target); $('f_rng').value = String(r.target); sim = null; lastRes = null;
      Snd.sfx('click'); say(`New target at ${r.target} m. Pick an angle, then find the launch speed!`);
    });
    $('f_ang').addEventListener('input', () => { const v = parseFloat($('f_ang').value); if (v > 0 && v < 90) r.angPreview = v; });
    r.angPreview = parseFloat($('f_ang').value) || 45;
  }
  $('dResults').innerHTML = '<p class="hint">Your results will show up here.</p>';
  r.fields.forEach((f) => $('f_' + f.k).addEventListener('keydown', (e) => { if (e.key === 'Enter') calculate(); }));
}
$('btnExample').addEventListener('click', () => {
  const r = RIDES[cur]; if (!r) return;
  r.fields.forEach((f) => { $('f_' + f.k).value = r.example[f.k] !== undefined ? r.example[f.k] : (f.def || ''); });
  if (cur === 'cannon') r.angPreview = parseFloat($('f_ang').value) || 45;
  Snd.sfx('click'); say('I filled in an example. Press AMUSE ME PHYSICS!');
});
$('btnClear').addEventListener('click', () => {
  const r = RIDES[cur]; if (!r) return;
  r.fields.forEach((f) => { $('f_' + f.k).value = f.def || ''; $('f_' + f.k).classList.remove('bad'); });
  sim = null; lastRes = null; $('dResults').innerHTML = '<p class="hint">Your results will show up here.</p>';
  Snd.sfx('click');
});
$('btnGo').addEventListener('click', calculate);

function readInputs() {
  const vals = {}, bad = [];
  RIDES[cur].fields.forEach((f) => {
    const el = $('f_' + f.k), s = el.value.trim().replace(',', '.');
    el.classList.remove('bad');
    if (s === '') { vals[f.k] = null; return; }
    const n = Number(s);
    if (!isFinite(n)) { vals[f.k] = null; bad.push(f.label); el.classList.add('bad'); } else vals[f.k] = n;
  });
  return { vals, bad };
}
function showError(msg) {
  $('dResults').innerHTML = `<p class="err">${esc(msg)}</p>`;
}
function showResults(res) {
  const rows = res.rows.map((r) =>
    `<div class="rrow${r.calc ? ' calc' : ''}"><span>${esc(r.label)}</span><b>${fix(r.val, 2)} <i>${esc(r.unit)}</i></b></div>`).join('');
  const warns = (res.warns || []).map((w) => `<p class="err">${esc(w)}</p>`).join('');
  $('dResults').innerHTML = `<h3>Results</h3><p class="hint">Yellow means Pip solved it for you.</p>${warns}<div class="rlist">${rows}</div>` +
    `<h3>How I solved it</h3><ol class="steps">${res.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  $('dScroll').scrollTop = 0;
}
function calculate() {
  if (!cur) return;
  Snd.start();
  const { vals, bad } = readInputs();
  if (bad.length) { const m = `I cannot read ${bad.join(', ')}. Use plain numbers like 12 or 3.5.`; showError(m); say(m); Snd.sfx('buzz'); return; }
  const res = SOLVE[cur](vals);
  if (res.error) { showError(res.error); say(res.error); Snd.sfx('buzz'); return; }
  lastRes = res; showResults(res); startSim(res);
  if (narrow()) { say('Watch the ride! Tap the arrow whenever you want to see the steps again.'); setTimeout(() => setDrawer(false), 600); }
  else say(`Done! I solved it. Watch the ${RIDES[cur].name.toLowerCase()} run.`);
}

/* ---------- simulation ---------- */
function startSim(res) {
  const T = Math.max(res.T, 0.01), play = clamp(T, 3, 12);
  sim = { data: res.data, T, tau: 0, speed: T / play, running: true, done: false, after: 0 };
  if (cur === 'cannon') Snd.sfx('boom'); else if (cur === 'coaster' || cur === 'drop') Snd.sfx('whoosh'); else Snd.sfx('bell');
  updateSpeedNote();
}
function updateSpeedNote() {
  const s = sim ? sim.speed : 1;
  $('speedNote').textContent = !sim ? '' : s < 0.95 ? `slow motion x${fix(s, 2)}` : s > 1.05 ? `fast forward x${fix(s, 1)}` : 'real time';
}
function stepSim(dt) {
  if (!sim) return;
  if (sim.running) {
    sim.tau += dt * sim.speed;
    if (sim.tau >= sim.T) { sim.tau = sim.T; sim.running = false; sim.done = true; onSimDone(); }
  } else sim.after += dt;
}
function onSimDone() {
  if (cur === 'cannon') {
    const D = RIDES.cannon.target, r = sim.data.tr.range, hit = Math.abs(r - D) <= 4;
    Snd.sfx('splat');
    if (hit) { setTimeout(() => Snd.sfx('ding'), 150); say(`BULLSEYE! You landed ${fix(r, 1)} m away, right on the ${D} m target!`); }
    else say(`Landed at ${fix(r, 1)} m. The target is at ${D} m, so you missed by ${fix(Math.abs(r - D), 1)} m. Change the angle or speed and try again!`);
  } else if (cur === 'drop') { Snd.sfx('clack'); say('Ride complete. Check the results bar for every measurement.'); }
  else say('Ride complete! Press the button again to replay it, or change the numbers.');
}
$('btnReplay').addEventListener('click', () => { if (lastRes) { startSim(lastRes); Snd.sfx('click'); } else say('Open the bar and press AMUSE ME PHYSICS first!'); });
$('btnReset').addEventListener('click', () => { sim = null; Snd.sfx('click'); updateSpeedNote(); });

/* readout chips */
function buildReadout() {
  $('chips').innerHTML = [0, 1, 2].map((i) => `<div class="chip"><span id="cl${i}"></span><b id="cv${i}">0</b> <i id="cu${i}"></i></div>`).join('');
  updateSpeedNote();
}
function updateReadout() {
  if (screen !== 'ride') return;
  const rows = RIDES[cur].live(sim);
  rows.forEach((r, i) => {
    const l = $('cl' + i), v = $('cv' + i), u = $('cu' + i);
    if (l.textContent !== r[0]) l.textContent = r[0];
    if (v.textContent !== r[1]) v.textContent = r[1];
    if (u.textContent !== r[2]) u.textContent = r[2];
  });
}

/* ---------- main loop ---------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
  cx.setTransform(S, 0, 0, S, 0, 0);
  World.update(dt, screen === 'ride' ? 'ride' : screen);
  stepSim(dt);
  if (screen === 'menu') World.drawMenu(cx, t);
  else if (screen === 'park') World.drawPark(cx, t, hover);
  else {
    World.drawRideBackdrop(cx, t);
    RIDES[cur].scene(cx, sim, t);
    nightPass(cx, t, 'ride');
    if (sim) hud(cx, RIDES[cur].live(sim));
  }
  vignette(cx);
  updateReadout();
  if (screen !== 'menu') {
    if (pip.shown < pip.text.length) { pip.shown = Math.min(pip.text.length, pip.shown + dt * 55); $('bubText').textContent = pip.text.slice(0, Math.floor(pip.shown)); }
    drawPip(t);
  }
  requestAnimationFrame(frame);
}

/* ===== v2: tickets, challenges, character, booth ===== */
const SAVE_KEY = 'amuse.v2';
const Save = (() => {
  let d = { tickets: 0, owned: [], streak: 0, best: 0, solved: 0, me: { name: 'Player', skin: K.skin, hair: '#2a1a0a', shirt: K.blue, pants: '#2b2d6b', hat: null, balloon: null, star: 0 } };
  try { const j = JSON.parse(lsGet(SAVE_KEY) || 'null'); if (j) d = { ...d, ...j, me: { ...d.me, ...(j.me || {}) } }; } catch (e) { /* fresh */ }
  return d;
})();
const persist = () => lsSet(SAVE_KEY, JSON.stringify(Save));
const num = (x) => String(+(+x).toFixed(3));

/* ---- prizes & character ---- */
const PRIZES = [
  { id: 'bal_r', n: 'Red Balloon', e: '🎈', c: 8, slot: 'balloon', v: K.red },
  { id: 'bal_b', n: 'Blue Balloon', e: '🎈', c: 8, slot: 'balloon', v: K.blue },
  { id: 'hat_top', n: 'Top Hat', e: '🎩', c: 15, slot: 'hat', v: '#111111' },
  { id: 'hat_pink', n: 'Party Hat', e: '🥳', c: 15, slot: 'hat', v: K.pink },
  { id: 'hair_neon', n: 'Neon Hair Dye', e: '💇', c: 20, slot: 'hair', v: '#59e0d0' },
  { id: 'bal_gold', n: 'Golden Balloon', e: '🎈', c: 30, slot: 'balloon', v: '#ffc400' },
  { id: 'shirt_gold', n: 'Golden Shirt', e: '👕', c: 35, slot: 'shirt', v: '#ffc400' },
  { id: 'hat_crown', n: 'Royal Crown', e: '👑', c: 50, slot: 'hat', v: '#ffc400' },
  { id: 'trophy', n: 'Champion Star', e: '⭐', c: 75, slot: 'star', v: 1 },
];
const OPT = { skin: ['#ffd7b0', '#f2c9a0', '#d9a577', '#a8714a', '#7a4b2a', '#5e3b1e'], hair: HAIRS.slice(), shirt: SHIRTS.slice(), pants: PANTS.slice(), hat: [null, K.red, K.blue], balloon: [null] };
const owns = (id) => Save.owned.includes(id);
function optsFor(k) { const b = OPT[k].slice(); PRIZES.forEach((p) => { if (p.slot === k && owns(p.id) && !b.includes(p.v)) b.push(p.v); }); return b; }
function syncMe() {
  ['park', 'ride'].forEach((k) => {
    const l = crowds[k]; let p = l.find((q) => q.me);
    if (!p) { p = Object.assign({}, l[0], { me: true, speed: 15, pause: 0 }); l.push(p); }
    const m = Save.me; Object.assign(p, { shirt: m.shirt, pants: m.pants, hair: m.hair, skin: m.skin, hat: m.hat, balloon: m.balloon, kid: false });
  });
}
function paintPerson(el, o) {
  const c = el.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, el.width, el.height); c.setTransform(6, 0, 0, 6, 0, 0);
  drawCrowd(c, [{ x: 10, y: 27, pause: 1, phase: 0, kid: false, dir: 1, shirt: o.shirt, pants: o.pants, hair: o.hair, skin: o.skin, hat: o.hat, balloon: o.balloon }], 0, false);
}
function tagMe(c, k) {
  const p = crowds[k].find((q) => q.me); if (!p) return;
  ptxt(c, (Save.me.star ? '★ ' : '') + Save.me.name, p.x, p.y - 27, K.yellow, 6, 'center');
  c.fillStyle = K.yellow; c.beginPath(); c.moveTo(p.x - 2, p.y - 19); c.lineTo(p.x + 2, p.y - 19); c.lineTo(p.x, p.y - 16.5); c.fill();
}

/* ---- modal plumbing ---- */
const modal = $('modal'), mbox = $('mbox');
const openModal = (h) => { mbox.innerHTML = h; modal.hidden = false; };
const closeModal = () => { modal.hidden = true; mbox.innerHTML = ''; };
modal.addEventListener('pointerdown', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

let charForced = false;
function openChar(force) {
  if (force !== undefined) charForced = !!force;
  const m = Save.me, rows = [['skin', 'Skin'], ['hair', 'Hair'], ['shirt', 'Shirt'], ['pants', 'Pants'], ['hat', 'Hat'], ['balloon', 'Balloon']];
  let h = `<h2>Your Character</h2>${!Save.customized ? '<p class="clerk">Make your character first. Then you can start the game!</p>' : ''}<div class="cwrap"><canvas id="pv" width="120" height="180" aria-label="Character preview"></canvas><div class="crows"><label class="fld"><span class="fl">Name</span><input id="nm" maxlength="12" value="${esc(m.name)}"></label>`;
  rows.forEach(([k, l]) => {
    h += `<div class="crow"><span>${l}</span><div class="sw">` + optsFor(k).map((v) =>
      `<button class="swb${m[k] === v ? ' on' : ''}" data-k="${k}" data-v="${v || ''}" style="background:${v || 'repeating-linear-gradient(45deg,#fff,#fff 3px,#e63946 3px,#e63946 5px)'}" aria-label="${l} ${v || 'none'}"></button>`).join('') + '</div></div>';
  });
  if (owns('trophy')) h += `<label class="crow"><input type="checkbox" id="stc" ${m.star ? 'checked' : ''}> Show ★ beside my name</label>`;
  h += '</div></div><p class="hint">Win tickets on rides, then spend them at the Ticket Booth for more looks.</p><div class="mrow"><button class="btn" id="cRand">Randomize</button><button class="btn go" id="cDone">' + (charForced ? "Done, let's play!" : 'Done') + '</button></div>';
  openModal(h); paintPerson($('pv'), m);
}

/* ---- ticket booth ---- */
let clerk = 'Step right up! Solve ride challenges to win tickets, then spend them here.';
function openBooth() {
  Snd.start(); Snd.sfx('bell');
  let h = `<h2>Ticket Booth</h2><div class="bhead"><canvas id="clk" width="120" height="180" aria-hidden="true"></canvas><div style="flex:1;min-width:180px"><p class="clerk">${esc(clerk)}</p><p class="bal">🎟 ${Save.tickets} tickets</p><p class="hint">Solved ${Save.solved} · Streak ${Save.streak} · Best ${Save.best}</p></div></div><button class="wheelbtn" id="bWheel"><span class="wicon" aria-hidden="true"></span><span class="wtxt"><b>🎡 Lucky Wheel!</b><small>${Save.tickets >= 5 ? 'Spin for up to 25 🎟 (5 🎟 a spin)' : 'Collect 5 🎟 to spin for up to 25 🎟'}</small></span></button><h3 class="ph">Prizes</h3><div class="pgrid">`;
  PRIZES.forEach((p) => {
    const o = owns(p.id), eq = p.slot === 'star' ? !!Save.me.star : Save.me[p.slot] === p.v;
    h += `<div class="prize${o ? ' own' : ''}"><span class="pe">${p.e}</span><b>${p.n}</b><span class="pc">${o ? (eq ? 'Wearing' : 'Owned') : '🎟 ' + p.c}</span><button class="btn sm${o ? '' : ' go'}" data-p="${p.id}" ${!o && Save.tickets < p.c ? 'disabled' : ''}>${o ? (eq ? 'Take off' : 'Wear') : 'Buy'}</button></div>`;
  });
  h += '</div><div class="mrow"><button class="btn" id="bChar">Customize me</button><button class="btn go" id="bDone">Done</button></div>';
  openModal(h); paintPerson($('clk'), { shirt: K.red, pants: '#2b2d6b', hair: '#6b3a12', skin: K.skin, hat: K.blue, balloon: K.yellow });
}
function prizeAction(id) {
  const p = PRIZES.find((x) => x.id === id); if (!p) return;
  const m = Save.me, set = (on) => { if (p.slot === 'star') m.star = on ? 1 : 0; else m[p.slot] = on ? p.v : (p.slot === 'hat' || p.slot === 'balloon' ? null : OPT[p.slot][0]); };
  if (!owns(id)) {
    if (Save.tickets < p.c) { clerk = `You need ${p.c - Save.tickets} more tickets for that one. Go win some!`; Snd.sfx('buzz'); }
    else { Save.tickets -= p.c; Save.owned.push(id); set(true); clerk = `Enjoy your ${p.n}! You look amazing!`; Snd.sfx('ding'); refreshTix(); }
  } else { const eq = p.slot === 'star' ? !!m.star : m[p.slot] === p.v; set(!eq); Snd.sfx('click'); clerk = eq ? 'Back in the box it goes.' : `Looking sharp in that ${p.n}!`; }
  persist(); syncMe(); checkBadges(); openBooth();
}
mbox.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; const m = Save.me;
  if (b.dataset.k) { if ($('nm')) m.name = $('nm').value; m[b.dataset.k] = b.dataset.v || null; persist(); syncMe(); Snd.sfx('click'); openChar(); }
  else if (b.dataset.p) prizeAction(b.dataset.p);
  else if (b.id === 'cRand') { ['skin', 'hair', 'shirt', 'pants'].forEach((k) => { m[k] = pick(optsFor(k)); }); m.hat = pick(optsFor('hat')); m.balloon = pick(optsFor('balloon')); if ($('nm')) m.name = $('nm').value; persist(); syncMe(); Snd.sfx('pick'); openChar(); }
  else if (b.id === 'cDone') { m.name = (($('nm') || { value: m.name }).value.trim() || 'Player').slice(0, 12); Save.customized = 1; persist(); syncMe(); syncStart(); Snd.sfx('bell'); closeModal(); if (charForced) { charForced = false; balloonTransition(() => setScreen('park')); } }
  else if (b.id === 'bDone') closeModal();
  else if (b.id === 'bChar') openChar(false);
});
mbox.addEventListener('input', (e) => { if (e.target.id === 'nm') { Save.me.name = e.target.value.slice(0, 12); persist(); } });
mbox.addEventListener('change', (e) => { if (e.target.id === 'stc') { Save.me.star = e.target.checked ? 1 : 0; persist(); } });
$('menuMe').addEventListener('click', () => { Snd.start(); Snd.sfx('click'); openChar(false); });
$('meBtn').addEventListener('click', () => { Snd.sfx('click'); openChar(false); });
$('rideList').insertAdjacentHTML('beforeend', '<button class="btn rb" id="boothBtn">🎟 Ticket Booth</button>');
$('boothBtn').addEventListener('click', openBooth);

/* clickable booth on the park map */
let boothHover = false;
const inBooth = (x, y) => x >= 204 && x <= 244 && y >= 142 && y <= 184;
cv.addEventListener('pointermove', (e) => { if (screen !== 'park') return; const [x, y] = canvasXY(e); boothHover = inBooth(x, y); if (boothHover) cv.style.cursor = 'pointer'; });
cv.addEventListener('pointerleave', () => { boothHover = false; });
cv.addEventListener('pointerdown', (e) => { if (screen !== 'park') return; const [x, y] = canvasXY(e); if (inBooth(x, y) && !World.hit(x, y)) openBooth(); });
const _dp = World.drawPark.bind(World), _db = World.drawRideBackdrop.bind(World);
World.drawPark = function (c, now, h) {
  _dp(c, now, h); nightPass(c, now, 'park'); tagMe(c, 'park');
  ptxt(c, boothHover ? 'TICKET BOOTH' : 'PRIZES!', 224, 130 - Math.round(Math.abs(Math.sin(now * 3)) * 2), K.yellow, 7, 'center');
};
World.drawRideBackdrop = function (c, now) { _db(c, now); tagMe(c, 'ride'); };

/* ticker */
let shownTix = Save.tickets;
function refreshTix() {
  const el = $('tixN'), from = shownTix, to = Save.tickets, t0 = performance.now(); shownTix = to;
  (function step(n) { const k = Math.min(1, (n - t0) / 600); el.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); })(t0);
  const t = $('tix'); t.classList.add('pop'); setTimeout(() => t.classList.remove('pop'), 500);
}
function popPlus(n) { const p = $('plus'); p.textContent = '+' + n + ' 🎟'; p.classList.remove('go'); void p.offsetWidth; p.classList.add('go'); }

/* ---- challenges ---- */
const SYM = {
  lin: { s: ['Δx', 'displacement', 'm'], u: ['Vi', 'initial velocity', 'm/s'], v: ['Vf', 'final velocity', 'm/s'], a: ['a', 'acceleration', 'm/s²'], t: ['t', 'time', 's'] },
  rot: { s: ['Δθ', 'angular displacement', 'rad'], u: ['ωi', 'initial angular velocity', 'rad/s'], v: ['ωf', 'final angular velocity', 'rad/s'], a: ['α', 'angular acceleration', 'rad/s²'], t: ['t', 'time', 's'] },
};
const EQ = { s: '{v} = {u} + {a}·{t}', v: '{s} = {u}·{t} + ½·{a}·{t}²', t: '{v}² = {u}² + 2·{a}·{s}', a: '{s} = ½·({u} + {v})·{t}' };
const fill = (tpl, f) => tpl.replace(/\{(\w)\}/g, (m, k) => f(k)).replace(/·/g, f.plug ? '×' : ' ');
const RCFG = {
  ferris: { m: 'rot', u: [0, 0.1, 0.2], a: [0.02, 0.03, 0.04, 0.05, 0.06], t: [10, 12, 15, 20], story: 'The Ferris wheel starts to turn, speeding up steadily.' },
  carousel: { m: 'rot', u: [0, 0.2, 0.5], a: [0.1, 0.15, 0.2, 0.25], t: [3, 4, 5, 6, 8], story: 'The carousel spins up to speed with constant angular acceleration.' },
  pirate: { m: 'rot', u: [0, 0], a: [0.2, 0.3, 0.4, 0.5], t: [1, 1.5, 2, 2.5], max: 1.3, story: 'The pirate ship swings down from its release point.' },
  drop: { m: 'lin', u: [0, 0, 3], a: [9.8], t: [1, 1.5, 2, 2.5, 3, 3.5], story: 'The drop tower carriage falls straight down.' },
  coaster: { m: 'lin', u: [0, 2, 4, 5], a: [2, 2.5, 3, 3.5, 4, 4.5], t: [3, 4, 5, 6], story: 'The roller coaster car rolls down the big drop.' },
  cannon: { m: 'proj', story: 'The cannon fires a ball from ground level. Gravity is 9.8 m/s² down.' },
};
const BASE = { carousel: 4, ferris: 5, drop: 6, pirate: 7, coaster: 8, cannon: 10 };
let ch = null;

function genKin(id) {
  const c = RCFG[id], ks = ['s', 'u', 'v', 'a', 't'];
  for (let n = 0; n < 80; n++) {
    const u = pick(c.u), a = pick(c.a), t = pick(c.t);
    const T = { s: +(u * t + 0.5 * a * t * t).toFixed(2), u, v: +(u + a * t).toFixed(2), a, t };
    if (c.max && T.s > c.max) continue;
    const tg = pick(ks.filter((k) => !(k === 'u' && u === 0))), rest = ks.filter((k) => k !== tg), un = pick(rest);
    if (un === 'u' || (tg === 't' && un === 'v')) continue;
    const g = rest.filter((k) => k !== un), r = solveKin(Object.fromEntries(g.map((k) => [k, T[k]])));
    if (r.error || Math.abs(r.vals[tg] - T[tg]) > Math.max(0.03 * Math.abs(T[tg]), 0.05)) continue;
    return { mode: c.m, id, T, tg, un, g, ans: T[tg] };
  }
  const T = { s: +(0.5 * c.a[0] * c.t[0] ** 2).toFixed(2), u: 0, v: +(c.a[0] * c.t[0]).toFixed(2), a: c.a[0], t: c.t[0] };
  return { mode: c.m, id, T, tg: 's', un: 'v', g: ['u', 'a', 't'], ans: T.s };
}
function genProj() {
  const v0 = pick([18, 20, 22, 25, 28, 30]), ang = pick([30, 40, 45, 50, 60]), tr = trajectory(v0, ang, 0), tg = pick(['T', 'H', 'R']);
  return { mode: 'proj', id: 'cannon', v0, ang, tr, tg, ans: +({ T: tr.T, H: tr.hmax, R: tr.range }[tg]).toFixed(2) };
}
function projEq(c) {
  const s = `${c.v0} × sin ${c.ang}°`;
  return { T: ['Vf = Vi + at with a = −g: at the top Vf = 0, so time up = Vi sinθ / g, and T = 2 × time up', `T = 2 × (${s}) / 9.8`], H: ['Vf² = Vi² + 2aΔy with a = −g and Vf = 0 at the top, so H = (Vi sinθ)² / 2g', `H = (${s})² / (2 × 9.8)`], R: ['R = Vi cosθ × T (steady horizontal speed × flight time)', `R = ${c.v0} × cos ${c.ang}° × T`] }[c.tg];
}
function chUnit() { if (ch.unitO) return ch.unitO; return ch.mode === 'proj' ? { T: 's', H: 'm', R: 'm' }[ch.tg] : SYM[ch.mode][ch.tg][2]; }
function eqHTML() {
  const c = ch;
  if (c.mode === 'proj') { const e = projEq(c); return `<b>Use:</b> ${e[0]}<br><b>Plug in:</b> ${e[1]}`; }
  const sy = (k) => SYM[c.mode][k][0], pl = (k) => (k === c.tg ? '?' : num(c.T[k])); pl.plug = true;
  return `<b>Not needed:</b> ${SYM[c.mode][c.un][1]} (${sy(c.un)})<br><b>Use:</b> ${fill(EQ[c.un], sy)}<br><b>Plug in:</b> ${fill(EQ[c.un], pl)}`;
}
function showEq() { $('chEq').innerHTML = eqHTML(); $('chEq').hidden = false; }
function fb(kind, html) { const f = $('chFb'); f.className = 'fb ' + kind; f.innerHTML = html; }

function newChallenge() {
  ch = cur === 'cannon' ? genProj() : genKin(cur); ch.att = 0; ch.done = false;
  const m = ch.mode, S2 = SYM[m === 'proj' ? 'lin' : m];
  $('chBadge').textContent = m === 'rot' ? '🌀 Rotational kinematics' : m === 'lin' ? '➡️ Translational kinematics' : '🎯 Translational: projectile';
  $('chRw').textContent = `Worth 🎟 ${Math.ceil(BASE[cur] * [1, 1.5, 2][ch.d || 0])}` + (Save.streak ? ` + ${Math.min(Save.streak, 5)} streak bonus` : '');
  $('chStory').textContent = RCFG[cur].story;
  let g, ask;
  if (m === 'proj') { g = [['initial speed Vi', ch.kmh ? num(ch.v0 * 3.6) : ch.v0, ch.kmh ? 'km/h' : 'm/s'], ['launch angle θ', ch.ang, '°']]; ask = { T: 'time in the air T', H: 'maximum height H', R: 'range (horizontal displacement) R' }[ch.tg]; }
  else { const cv = convs(ch); g = ch.g.map((k) => (ch.d && cv[k] && ch.T[k] !== 0 ? [`${S2[k][1]} ${S2[k][0]}`, num(ch.T[k] * cv[k][0]), cv[k][1]] : [`${S2[k][1]} ${S2[k][0]}`, num(ch.T[k]), S2[k][2]])); ask = `${S2[ch.tg][1]} ${S2[ch.tg][0]}`; }
  $('chGiven').innerHTML = g.map((x) => `<span class="gv">${esc(x[0])} = <b>${x[1]}</b> ${x[2]}</span>`).join('');
  $('chAsk').innerHTML = `Find the <b>${esc(ask)}</b>`;
  $('chUnit').textContent = chUnit();
  $('chIn').value = ''; $('chIn').disabled = false; $('chSubmit').disabled = false;
  $('chEq').hidden = true; $('chNew').classList.remove('go', 'glow'); fb('', '');
}
function runRide() {
  const r = RIDES[cur], f = {}; r.fields.forEach((x) => { f[x.k] = null; }); const T = ch.T || {}; let v;
  if (cur === 'ferris') v = { r: 12, u: T.u, a: T.a, t: T.t };
  else if (cur === 'coaster') v = { ang: 35, u: T.u, a: T.a, t: T.t };
  else if (cur === 'drop') v = { u: T.u, a: T.a, t: T.t };
  else if (cur === 'carousel') v = { r: 6, u: T.u, a: T.a, t: T.t };
  else if (cur === 'pirate') v = { L: 12, u: T.u, a: T.a, t: T.t };
  else { v = { v0: ch.v0, ang: ch.ang, h0: 0 }; r.angPreview = ch.ang; r.target = Math.max(5, Math.round(ch.tr.range / 5) * 5); }
  const res = SOLVE[cur](Object.assign(f, v)); if (res.error) return;
  res.quiet = true; lastRes = res; showResults(res); startSim(res);
}
function submitAnswer() {
  if (!ch || ch.done) return; Snd.start();
  const raw = $('chIn').value.trim().replace(',', '.'), n = Number(raw);
  if (raw === '' || !isFinite(n)) { fb('err', 'Type a number first, like 12.5'); Snd.sfx('buzz'); return; }
  ch.att++;
  if (Math.abs(n - ch.ans) <= Math.max(0.02 * Math.abs(ch.ans), 0.06)) {
    const b = Math.ceil(BASE[cur] * [1, 1.5, 2][ch.d || 0]), base = ch.att === 1 ? b : Math.ceil(b / 2), bonus = Math.min(Save.streak, 5), tot = base + bonus;
    Save.tickets += tot; Save.streak++; Save.solved++; Save.best = Math.max(Save.best, Save.streak); Save.earned += tot; Save.rideWins[cur] = (Save.rideWins[cur] || 0) + 1; if (ch.att === 1 && cur === 'cannon') Save.bull = 1; if (nightGoal) Save.nightWins++; if (ch.d === 2) Save.hardWins++; checkBadges(); persist();
    ch.done = true; $('chIn').disabled = true; $('chSubmit').disabled = true; $('chNew').classList.add('go', 'glow');
    fb('ok', `✔ Correct! The answer is ${num(ch.ans)} ${chUnit()}. You won <b>${tot} tickets</b> (${base} for the ride${ch.att > 1 ? ', half for the 2nd try' : ''}${bonus ? ` + ${bonus} streak bonus` : ''}).`);
    showEq(); refreshTix(); popPlus(tot); Snd.sfx('ding'); say(`Correct! +${tot} tickets. Watch the ${RIDES[cur].name.toLowerCase()} run, then try another!`); runRide();
  } else if (ch.att < 2) {
    fb('err', 'Not quite. Check your signs and units. Here is a hint, and you get one more try for half tickets.'); showEq(); Snd.sfx('buzz');
  } else {
    Save.streak = 0; persist(); ch.done = true; $('chIn').disabled = true; $('chSubmit').disabled = true; $('chNew').classList.add('go', 'glow');
    fb('err', `✘ The answer was <b>${num(ch.ans)} ${chUnit()}</b>. No tickets this time and your streak reset. Study the equation, then try a new problem.`);
    showEq(); Snd.sfx('buzz'); say('Good effort! Look at the equation and plug in the numbers. You can do the next one!');
  }
}
$('chSubmit').addEventListener('click', submitAnswer);
$('chIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer(); });
$('chHint').addEventListener('click', () => { if (ch) { showEq(); Snd.sfx('click'); } });
$('chNew').addEventListener('click', () => { newChallenge(); Snd.sfx('click'); say('New problem! Which equation is missing a quantity you do not need?'); });

/* quiet playback for challenge rides (no sandbox "missed target" talk) */
const _st = startSim; startSim = function (res) { _st(res); if (res.quiet && sim) sim.quiet = true; };
const _osd = onSimDone; onSimDone = function () { if (sim && sim.quiet) { Snd.sfx(cur === 'cannon' ? 'splat' : 'clack'); return; } _osd(); };
const _ss = setScreen;
setScreen = function (n, r) { _ss(n, r); $('chal').hidden = n !== 'ride'; if (n === 'ride') newChallenge(); };
syncMe(); $('tixN').textContent = Save.tickets;

/* ===== v3: night mode, trees, cartoon menu, balloon transition ===== */
function mixc(a, b, t) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
let nightGoal = Save.night ? 1 : 0, nightT = nightGoal;
function setNight(on) {
  Save.night = on ? 1 : 0; nightGoal = Save.night; persist(); Snd.sfx('click');
  $('nightBtn').textContent = on ? '☀️ Day' : '🌙 Night'; $('menuNight').textContent = on ? '☀️ Day mode' : '🌙 Night mode';
}
$('nightBtn').addEventListener('click', () => setNight(!nightGoal));
$('menuNight').addEventListener('click', () => { Snd.start(); setNight(!nightGoal); });
$('nightBtn').textContent = nightGoal ? '☀️ Day' : '🌙 Night'; $('menuNight').textContent = nightGoal ? '☀️ Day mode' : '🌙 Night mode';
const _wu = World.update.bind(World);
World.update = function (dt, sc) { _wu(dt, sc); nightT += (nightGoal - nightT) * Math.min(1, dt * 2.2); if (Math.abs(nightGoal - nightT) < 0.002) nightT = nightGoal; };
const _df = drawFerris; drawFerris = function (c, x, y, r, a, night, tr) { _df(c, x, y, r, a, night || nightT > 0.5, tr); };

/* soft glow */
function glow(c, x, y, r, rgb, a) { const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
const LIGHT_RIDE = { ferris: '255,111,181', drop: '89,224,208', coaster: '255,210,63', cannon: '255,140,26', carousel: '255,111,181', pirate: '90,160,255' };
const NSTARS = []; for (let i = 0; i < 90; i++) NSTARS.push([rnd(0, W), rnd(12, 100), Math.random() < 0.2 ? 1.6 : 1]);
function nightPass(c, now, mode) {
  const n = nightT; if (n < 0.01) return;
  c.save();
  c.globalCompositeOperation = 'multiply'; c.fillStyle = mixc('#ffffff', '#7a86cc', n); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = n;
  NSTARS.forEach((st, i) => { if (Math.floor(now * 1.5 + i) % 9) { c.fillStyle = K.ink; c.fillRect(st[0], st[1], st[2], st[2]); } });
  const mx = mode === 'menu' ? 66 : 334, my = mode === 'menu' ? 40 : 34;
  glow(c, mx, my, 40, '255,250,210', 0.5); disc(c, mx, my, 10, '#fffbe0', true); disc(c, mx - 3, my - 2, 1.6, '#e6dfae', true); disc(c, mx + 3, my + 3, 2, '#e6dfae', true);
  c.globalCompositeOperation = 'lighter';
  const L = [];
  if (mode === 'park') {
    Object.keys(PARK_POS).forEach((id) => { const p = PARK_POS[id], b = RIDES[id].box; L.push([p.x + (b.x0 + b.x1) / 2, p.y + (b.y0 + b.y1) / 2, Math.max(b.x1 - b.x0, b.y1 - b.y0) * 0.75, LIGHT_RIDE[id], 0.45]); });
    [20, 96, 168, 260, 350].forEach((x) => L.push([x, PATH_Y - 34, 26, '255,225,120', 0.6]));
    L.push([224, 162, 34, '255,90,90', 0.5]);
  } else if (mode === 'ride') {
    L.push([192, 120, 170, '255,200,120', 0.22], [22, 144, 34, '255,225,120', 0.6], [362, 144, 34, '255,225,120', 0.6]);
  } else {
    L.push([316, 110, 80, '255,111,181', 0.45], [238, 110, 40, '89,224,208', 0.45], [90, 130, 70, '255,210,63', 0.4], [192, 190, 120, '255,200,120', 0.25]);
  }
  L.forEach(([x, y, r, rgb, a]) => glow(c, x, y, r, rgb, a * n));
  for (let x = 0; x <= W; x += 16) {
    const y = 8 + Math.round(6 * Math.sin((x / W) * Math.PI * 6)), on = (Math.floor(now * 3) + x / 16) % 2;
    glow(c, x, y + 2, 7, on ? '255,210,63' : '255,111,181', 0.55 * n); disc(c, x, y + 2.5, 1.7, on ? '#fff3b0' : '#ffd0e6', true);
  }
  c.restore();
}

/* trees behind every ride */
function pine(c, x, y, s) {
  shadowEl(c, x + 4 * s, y + 1, 10 * s, 2.5 * s, 0.22); R(c, x - 1.6 * s, y - 8 * s, 3.2 * s, 8 * s, K.brown);
  for (let k = 0; k < 3; k++) {
    const w = (12 - k * 2.6) * s, yb = y - (5 + k * 8) * s;
    c.fillStyle = K.greenD; c.beginPath(); c.moveTo(x - w, yb); c.lineTo(x + w, yb); c.lineTo(x, yb - 15 * s); c.closePath(); c.fill();
    c.fillStyle = K.green; c.beginPath(); c.moveTo(x - w * 0.8, yb - 1); c.lineTo(x + w * 0.1, yb - 1); c.lineTo(x, yb - 14 * s); c.closePath(); c.fill();
  }
}
const TL = []; for (let i = 0; i < 17; i++) TL.push({ x: i * 24 + rnd(-6, 6), y: 144 + rnd(0, 14), s: rnd(1.3, 1.9), pine: i % 3 === 1, ph: rnd(0, 6) });
TL.sort((a, b) => a.y - b.y);
function treeLine(c, now) {
  TL.forEach((t) => { c.save(); c.translate(t.x, t.y); c.transform(1, 0, Math.sin(now * 1.3 + t.ph) * 0.015, 1, 0, 0); (t.pine ? pine : tree)(c, 0, 0, t.s); c.restore(); });
}

/* cartoon daytime menu */
function hotAir(c, x, y, sc, c1, c2, t) {
  const by = y + Math.sin(t * 1.3 + x) * 3;
  c.save(); c.beginPath(); c.arc(x, by, 13 * sc, 0, TAU); c.clip();
  for (let i = -3; i < 3; i++) { c.fillStyle = i % 2 ? c1 : c2; c.fillRect(x + i * 4.6 * sc, by - 14 * sc, 4.6 * sc, 28 * sc); }
  const g = c.createRadialGradient(x - 5 * sc, by - 6 * sc, 2, x, by, 15 * sc); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(0,0,60,.28)');
  c.fillStyle = g; c.fillRect(x - 14 * sc, by - 14 * sc, 28 * sc, 28 * sc); c.restore();
  c.lineWidth = 1; c.strokeStyle = K.dark; c.beginPath(); c.arc(x, by, 13 * sc, 0, TAU); c.stroke();
  line(c, x - 8 * sc, by + 10 * sc, x - 3 * sc, by + 19 * sc, K.dark, 0.6); line(c, x + 8 * sc, by + 10 * sc, x + 3 * sc, by + 19 * sc, K.dark, 0.6);
  rr(c, x - 4 * sc, by + 19 * sc, 8 * sc, 5 * sc, 1, K.brown);
}
const CONF = []; for (let i = 0; i < 46; i++) CONF.push({ x: rnd(0, W), p: rnd(0, 1), sp: rnd(10, 22), col: pick([K.red, K.yellow, K.blue, K.green, K.pink, K.orange, K.purple]), r: rnd(0, 6) });
World.drawMenu = function (c, now) {
  const sk = c.createLinearGradient(0, 0, 0, 150); sk.addColorStop(0, mixc('#2fb6ff', '#0a1040', nightT)); sk.addColorStop(1, mixc('#c9f4ff', '#4b4aa0', nightT));
  c.fillStyle = sk; c.fillRect(0, 0, W, H);
  c.globalAlpha = 1 - nightT;
  c.save(); c.translate(66, 40); c.rotate(now * 0.25);
  for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.fillStyle = i % 2 ? K.orange : K.yellow; c.beginPath(); c.moveTo(-3, -18); c.lineTo(3, -18); c.lineTo(0, -29); c.fill(); }
  c.restore(); disc(c, 66, 40, 14, K.yellow);
  disc(c, 61, 38, 1.5, K.dark, true); disc(c, 71, 38, 1.5, K.dark, true); disc(c, 58, 44, 2.2, 'rgba(255,111,181,.7)', true); disc(c, 74, 44, 2.2, 'rgba(255,111,181,.7)', true);
  c.strokeStyle = K.dark; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.arc(66, 42, 5, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.globalAlpha = 1;
  ['#ff4d6d', '#ff9a3c', '#ffd23f', '#3ddc84', '#3ab0ff', '#6a5cff', '#c77dff'].forEach((col, i) => { c.beginPath(); c.arc(112, 170, 112 - i * 5, Math.PI, TAU); c.lineWidth = 5.2; c.strokeStyle = col; c.stroke(); });
  CLOUDS.forEach((cl) => drawCloud(c, ((cl.x + now * 4 * cl.s) % (W + 60)) - 30, cl.y + 6, cl.s * 1.15));
  hotAir(c, 118, 96, 0.9, K.red, K.yellow, now); hotAir(c, 36, 108, 0.65, K.blue, K.pink, now + 2);
  hillPath(c, 150, (x) => 24 + 9 * Math.sin(x * 0.03) + 5 * Math.sin(x * 0.08), '#8cf0aa', '#4fd18a');
  hillPath(c, 160, (x) => 10 + 5 * Math.sin(x * 0.05 + 1), '#6ee08f', '#2fbf6a');
  drawFerris(c, 316, 172, 62, now * 0.28, false);
  c.save(); c.translate(18, 172); drawTrack(c, PARK_COASTER, 0, -2, 142); drawCar(c, PARK_COASTER, (now * 28) % PARK_COASTER.len, 0.8); c.restore();
  drawDrop(c, 238, 172, 92, Math.round(172 - 14 - Math.abs(Math.sin(now * 0.5)) * 70));
  const gg = c.createLinearGradient(0, 160, 0, 178); gg.addColorStop(0, '#59d977'); gg.addColorStop(1, '#2fae56'); c.fillStyle = gg; c.fillRect(0, 160, W, 18);
  const pg = c.createLinearGradient(0, 176, 0, H); pg.addColorStop(0, '#fff0c2'); pg.addColorStop(1, '#f2c77c'); c.fillStyle = pg; c.fillRect(0, 176, W, H - 176);
  c.fillStyle = 'rgba(150,90,30,.18)'; for (let y = 188, r = 0; y < H; y += 12, r++) { c.fillRect(0, y, W, 0.6); for (let x = (r % 2) * 12; x < W; x += 24) c.fillRect(x, y - 11, 0.6, 11); }
  TUFTS.forEach((p, i) => { if (i % 4 === 0 && p[1] > 160) { line(c, p[0], p[1] + 8, p[0], p[1] + 12, K.greenD, 0.7); disc(c, p[0], p[1] + 7, 1.7, [K.pink, K.yellow, K.white, K.red][i % 4 === 0 ? (i / 4) % 4 | 0 : 0], true); } });
  for (let x = 6; x < W; x += 24) {
    const y = 6 + Math.round(8 * Math.sin((x / W) * Math.PI * 4)), col = [K.red, K.yellow, K.blue, K.green, K.pink][(x / 24) % 5 | 0];
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y); c.lineTo(x + 7, y + 13); c.closePath(); c.fill(); c.lineWidth = 0.8; c.strokeStyle = K.dark; c.stroke();
  }
  drawCrowd(c, crowds.menu, clock, false);
  CONF.forEach((q) => { const y = ((q.p * H + now * q.sp) % (H + 8)) - 4, x = q.x + Math.sin(now + q.r) * 6; c.save(); c.translate(x, y); c.rotate(now * 2 + q.r); c.fillStyle = q.col; c.fillRect(-1.6, -0.9, 3.2, 1.8); c.restore(); });
  bursts.forEach((b) => { c.globalAlpha = clamp(1.6 - b.age, 0, 1); b.ps.forEach((p) => disc(c, p.x, p.y, 1.4, b.col, true)); c.globalAlpha = 1; });
  nightPass(c, now, 'menu'); vignette(c);
};
/* bubble title: wrap each letter */
(function () {
  const cols = ['#ff4d6d', '#ffd23f', '#3ddc84', '#3ab0ff', '#ff9a3c', '#c77dff', '#59e0d0', '#ff6fb5']; let n = 0;
  document.querySelectorAll('.logo span').forEach((sp) => {
    sp.innerHTML = [...sp.textContent].map((ch) => ch === ' ' ? '<i class="sp"> </i>' : `<i style="--c:${cols[n % cols.length]};--d:${(n++ * 0.12).toFixed(2)}s">${ch}</i>`).join('');
  });
})();

/* balloons rise, cover the screen, switch scene, then float away */
const BALS = ['#e63946', '#ffd23f', '#3a86ff', '#3ddc84', '#ff6fb5', '#ff8c1a', '#8338ec', '#59e0d0'].map((col) => {
  const e = mk(100, 170), x = e.getContext('2d'), g = x.createRadialGradient(36, 36, 6, 50, 58, 58);
  g.addColorStop(0, shade(col, 0.6)); g.addColorStop(0.35, col); g.addColorStop(1, shade(col, -0.35));
  x.fillStyle = g; x.beginPath(); x.ellipse(50, 58, 42, 52, 0, 0, TAU); x.fill();
  x.fillStyle = shade(col, -0.3); x.beginPath(); x.moveTo(50, 108); x.lineTo(42, 122); x.lineTo(58, 122); x.closePath(); x.fill();
  x.lineWidth = 3; x.strokeStyle = '#0d0620'; x.beginPath(); x.ellipse(50, 58, 42, 52, 0, 0, TAU); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.ellipse(33, 35, 7, 13, -0.5, 0, TAU); x.fill();
  x.strokeStyle = '#fff4d6'; x.lineWidth = 2; x.beginPath(); x.moveTo(50, 122); x.bezierCurveTo(38, 136, 62, 148, 50, 168); x.stroke();
  return e;
});
let balBusy = false;
function balloonTransition(done) {
  if (balBusy) return; balBusy = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); balBusy = false; return; }
  const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), k = w < 700 ? 0.75 : 1;
  const el = document.createElement('canvas'); el.width = w * dpr; el.height = h * dpr; el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:60';
  document.body.appendChild(el); const c = el.getContext('2d'); c.scale(dpr, dpr);
  const cols = Math.ceil(w / (64 * k)) + 2, rows = Math.ceil((h + 60 * k) / (70 * k)) + 2, V = h * 0.8, sp = [], bl = [];
  for (let i = 0; i < cols; i++) sp.push(V * (0.97 + 0.06 * Math.random()));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) bl.push({ i, x: (i - 0.5 + (j % 2) * 0.5) * 64 * k + rnd(-6, 6) * k, y0: h + 90 * k + j * 70 * k + rnd(-6, 6) * k, spr: BALS[(i * 3 + j * 5 + ri(0, 2)) % 8], ph: rnd(0, 6) });
  const tSw = (h + 110 * k) / (V * 0.97) + 0.05, tEnd = (h + 90 * k + rows * 70 * k + 260 * k) / (V * 0.97); let t0 = null, sw = false;
  Snd.sfx('whoosh');
  (function f(now) {
    if (t0 === null) t0 = now; const t = (now - t0) / 1000; c.clearRect(0, 0, w, h);
    for (const b of bl) { const y = b.y0 - sp[b.i] * t; if (y < -130 * k || y > h + 130 * k) continue; c.drawImage(b.spr, b.x + Math.sin(t * 2.2 + b.ph) * 5 * k - 50 * k, y - 58 * k, 100 * k, 170 * k); }
    if (!sw && t >= tSw) { sw = true; done(); }
    if (t < tEnd) requestAnimationFrame(f); else { el.remove(); balBusy = false; }
  })(performance.now());
}


/* ===== v4: difficulty, lucky wheel, badges ===== */
['earned', 'nightWins', 'hardWins', 'spins', 'diff', 'bull', 'jackpot'].forEach((k) => { Save[k] = Save[k] || 0; });
Save.badges = Save.badges || {}; Save.rideWins = Save.rideWins || {};

/* difficulty: Medium/Hard give some values in km/h, rpm or revolutions */
function convs(c) { return c.mode === 'rot' ? { s: [1 / TAU, 'rev'], u: [60 / TAU, 'rpm'], v: [60 / TAU, 'rpm'] } : c.mode === 'lin' ? { u: [3.6, 'km/h'], v: [3.6, 'km/h'] } : {}; }
const _gk = genKin;
genKin = function (id) {
  const d = Save.diff; let c;
  for (let n = 0; n < 80; n++) {
    c = _gk(id); if (!d) break;
    const cv = convs(c), ng = c.g.filter((k) => cv[k] && c.T[k] !== 0).length;
    if (ng >= 1 && (d === 1 || cv[c.tg] || ng >= 2)) break;
  }
  c.d = d; const cv = convs(c), S2 = SYM[c.mode];
  c.convNote = d ? c.g.filter((k) => cv[k] && c.T[k] !== 0).map((k) => `${num(c.T[k] * cv[k][0])} ${cv[k][1]} = ${num(c.T[k])} ${S2[k][2]}`).join('; ') : '';
  if (d === 2 && cv[c.tg]) { c.ans = c.T[c.tg] * cv[c.tg][0]; c.unitO = cv[c.tg][1]; }
  return c;
};
const _gp = genProj;
genProj = function () { const c = _gp(); c.d = Save.diff; if (c.d) { c.kmh = true; c.convNote = `${num(c.v0 * 3.6)} km/h = ${c.v0} m/s`; } return c; };
const _eh = eqHTML; eqHTML = function () { return (ch.convNote ? `<b>Convert first:</b> ${ch.convNote}<br>` : '') + _eh(); };
const DNOTE = ['', 'Some values come in km/h, rpm or revolutions. Convert them first!', 'Same conversions, and the answer may be asked in those units too.'];
function syncDiff() {
  document.querySelectorAll('#diff [data-d]').forEach((b) => b.classList.toggle('on', +b.dataset.d === Save.diff));
  $('diffNote').textContent = DNOTE[Save.diff];
}
$('diff').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; Save.diff = +b.dataset.d; persist(); Snd.sfx('click'); newChallenge(); });
const _nc2 = newChallenge; newChallenge = function () { _nc2(); syncDiff(); };

/* badges */
const BADGES = [
  ['first', '🎟', 'First Ticket', 'Solve your first challenge', () => Save.solved >= 1],
  ['ten', '🔟', 'Problem Solver', 'Solve 10 challenges', () => Save.solved >= 10],
  ['streak', '🔥', 'Hot Streak', 'Get 5 correct in a row', () => Save.best >= 5],
  ['explorer', '🧭', 'Park Explorer', 'Win on all 6 rides', () => Object.keys(Save.rideWins).length >= 6],
  ['bull', '🎯', 'Bullseye', 'Cannon problem right on the first try', () => Save.bull > 0],
  ['tycoon', '💰', 'Ticket Tycoon', 'Earn 100 tickets in total', () => Save.earned >= 100],
  ['owl', '🦉', 'Night Owl', 'Solve 3 problems in night mode', () => Save.nightWins >= 3],
  ['brain', '🧠', 'Brainiac', 'Solve a Hard problem', () => Save.hardWins >= 1],
  ['shop', '🛍️', 'First Prize', 'Buy something at the booth', () => Save.owned.length >= 1],
  ['coll', '🏆', 'Collector', 'Own 5 prizes', () => Save.owned.length >= 5],
  ['lucky', '🍀', 'Jackpot!', 'Land on 25 on the Lucky Wheel', () => Save.jackpot > 0],
];
function toast(t) { const e = $('toast'); e.textContent = t; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); Snd.sfx('bell'); }
function checkBadges() {
  let n = 0;
  BADGES.forEach((b) => { if (!Save.badges[b[0]] && b[4]()) { Save.badges[b[0]] = 1; Save.tickets += 3; Save.earned += 3; n++; setTimeout(() => toast(`${b[1]} Badge: ${b[2]}! +3 🎟`), 1200 + (n - 1) * 3300); } });
  if (n) { persist(); refreshTix(); }
}
function openBadges() {
  const got = BADGES.filter((b) => Save.badges[b[0]]).length;
  openModal(`<h2>Badges ${got}/${BADGES.length}</h2><p class="hint">Each new badge gives +3 tickets.</p><div class="pgrid">` + BADGES.map((b) =>
    `<div class="prize${Save.badges[b[0]] ? ' own' : ' lock'}"><span class="pe">${b[1]}</span><b>${b[2]}</b><span class="hint">${b[3]}</span></div>`).join('') + '</div><div class="mrow"><button class="btn go" id="bDone">Done</button></div>');
}
$('badgeBtn').addEventListener('click', () => { Snd.sfx('click'); openBadges(); });

/* lucky wheel (a rotational-kinematics toy: ω and α change as it slows down) */
const WHEEL = [[0, '#8b8fa8'], [2, '#3a86ff'], [3, '#3ddc84'], [4, '#ffd23f'], [6, '#ff8c1a'], [8, '#ff6fb5'], [12, '#8338ec'], [25, '#e63946']], WWT = [20, 20, 18, 14, 12, 9, 5, 2];
let wheelRot = 0, spinning = false;
function openWheel() {
  openModal(`<h2>Lucky Wheel</h2><div class="wcol"><canvas id="wh" width="300" height="320" aria-label="Lucky wheel"></canvas><p class="bal" id="wRes">🎟 ${Save.tickets}</p><p class="hint" id="wOm">A spin costs 5 tickets. Land on a number to win that many!</p><div class="mrow"><button class="btn" id="wBack">Back</button><button class="btn go" id="wSpin"${Save.tickets < 5 ? ' disabled' : ''}>Spin! (5 🎟)</button></div></div>`);
  drawWheel();
}
function drawWheel() {
  const el = $('wh'); if (!el) return; const c = el.getContext('2d'), R0 = 138, seg = TAU / 8;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 300, 320); c.translate(150, 166); c.rotate(wheelRot);
  WHEEL.forEach((w, i) => {
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R0, i * seg, (i + 1) * seg); c.closePath(); c.fillStyle = w[1]; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0d0620'; c.stroke();
    c.save(); c.rotate(i * seg + seg / 2); c.font = "400 30px Chewy, Fredoka, sans-serif"; c.textAlign = 'right'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = '#0d0620'; c.strokeText(w[0], R0 - 14, 0); c.fillStyle = '#fff'; c.fillText(w[0], R0 - 14, 0); c.restore();
  });
  c.rotate(-wheelRot); c.beginPath(); c.arc(0, 0, R0 + 5, 0, TAU); c.lineWidth = 8; c.strokeStyle = '#0d0620'; c.stroke();
  const on = Math.floor(performance.now() / 220) % 2;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; c.beginPath(); c.arc(Math.cos(a) * (R0 + 5), Math.sin(a) * (R0 + 5), 4, 0, TAU); c.fillStyle = (i + on) % 2 ? '#ffd23f' : '#fff'; c.fill(); }
  c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fillStyle = '#ffd23f'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#0d0620'; c.stroke();
  c.beginPath(); c.moveTo(-14, -R0 - 18); c.lineTo(14, -R0 - 18); c.lineTo(0, -R0 + 12); c.closePath(); c.fillStyle = '#e63946'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0d0620'; c.stroke();
}
function spinWheel() {
  if (spinning || Save.tickets < 5) return; Snd.start(); Snd.sfx('whoosh');
  Save.tickets -= 5; persist(); refreshTix(); spinning = true; $('wSpin').disabled = true; $('wBack').disabled = true;
  let r = Math.random() * 100, idx = 0; for (; idx < 7 && r >= WWT[idx]; idx++) r -= WWT[idx];
  const seg = TAU / 8, jit = (Math.random() - 0.5) * seg * 0.7, r0 = wheelRot;
  const target = r0 + TAU * 5 + ((((1.5 * Math.PI - (idx + 0.5) * seg + jit - r0) % TAU) + TAU) % TAU), D = 4200, t0 = performance.now();
  let prev = r0, pt = t0;
  (function f(now) {
    const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
    wheelRot = r0 + (target - r0) * e; drawWheel();
    const om = Math.abs(wheelRot - prev) / Math.max(0.001, (now - pt) / 1000); prev = wheelRot; pt = now;
    const t = $('wOm'); if (t && k < 1) t.textContent = `Wheel physics: ω ≈ ${fix(om, 1)} rad/s, slowing down`;
    if (k < 1) requestAnimationFrame(f); else wheelDone(idx);
  })(t0);
}
function wheelDone(idx) {
  const win = WHEEL[idx][0]; spinning = false;
  Save.tickets += win; Save.earned += win; Save.spins++; if (win >= 25) Save.jackpot = 1; persist(); refreshTix();
  Snd.sfx(win ? 'ding' : 'buzz'); checkBadges();
  const rs = $('wRes'); if (rs) { rs.textContent = win ? `You won ${win} 🎟! You have ${Save.tickets}` : `0 tickets. Spin again!`; $('wOm').textContent = 'The wheel stopped: ω = 0 rad/s'; $('wBack').disabled = false; $('wSpin').disabled = Save.tickets < 5; }
}
mbox.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'bWheel') { Snd.sfx('click'); openWheel(); } else if (b.id === 'wSpin') spinWheel(); else if (b.id === 'wBack') openBooth();
});
syncDiff();

/* ===== v5: lollipop circus-ball sliders + randomize ===== */
const SLD = {
  ferris: { r: [4, 30, 0.1], s: [0, 40, 0.01], t: [0, 40, 0.1], v: [0, 2, 0.01], a: [0, 0.2, 0.005], u: [0, 1, 0.01] },
  coaster: { ang: [10, 80, 0.5], mu: [0, 0.5, 0.01], s: [0, 150, 0.1], t: [0, 15, 0.1], v: [0, 40, 0.1], a: [0, 10, 0.01], u: [0, 15, 0.1] },
  cannon: { rng: [10, 100, 0.5], ang: [5, 85, 0.5], h0: [0, 30, 0.5], v0: [5, 50, 0.1] },
  drop: { s: [0, 100, 0.1], t: [0, 6, 0.01], v: [0, 60, 0.1], a: [0, 20, 0.01], u: [0, 20, 0.1] },
  carousel: { r: [2, 12, 0.1], s: [0, 60, 0.01], t: [0, 60, 0.1], v: [0, 5, 0.01], a: [0, 0.5, 0.005], u: [0, 3, 0.01], m: [10, 120, 1] },
  pirate: { L: [4, 25, 0.1], s: [0, 2.4, 0.01], t: [0, 10, 0.01], v: [0, 4, 0.01], a: [0, 1.5, 0.01], u: [0, 2, 0.01] },
};
const decs = (st) => (String(st).split('.')[1] || '').length;
function paintSl(k) {
  const [mn, mx, st] = SLD[cur][k], inp = $('f_' + k), sl = $('s_' + k), v = inp.value.trim(), n = Number(v), solving = v === '' || !isFinite(n);
  if (!solving) sl.value = n;
  const pct = ((+sl.value - mn) / (mx - mn)) * 100;
  inp.closest('.fld').classList.toggle('solving', solving);
  { const e = $('v_' + k); if (document.activeElement !== e) e.value = solving ? '?' : num(n); }
  $('q_' + k).textContent = solving ? 'Pip is solving ✓' : 'Let Pip solve it';
  sl.style.setProperty('--p', pct + '%'); sl.style.setProperty('--a', pct * 7.2 + 'deg');
}
function syncSliders() { if (cur && SLD[cur]) RIDES[cur].fields.forEach((f) => paintSl(f.k)); }
function makeSliders(id) {
  RIDES[id].fields.forEach((f) => {
    const [mn, mx, st] = SLD[id][f.k], inp = $('f_' + f.k), lab = inp.closest('label');
    lab.removeAttribute('for'); lab.classList.add('sl'); inp.type = 'hidden';
    lab.querySelector('.fl').insertAdjacentHTML('beforeend', `<input class="sv" id="v_${f.k}" inputmode="decimal" autocomplete="off" title="Click to type an exact number" aria-label="${esc(f.label)} value">`);
    lab.insertAdjacentHTML('beforeend', `<div class="srow"><input type="range" class="lol" id="s_${f.k}" min="${mn}" max="${mx}" step="${st}" value="${(mn + mx) / 2}" aria-label="${esc(f.label)}"><button type="button" class="sol" id="q_${f.k}"></button></div>`);
    const sl = $('s_' + f.k), put = () => { inp.value = String(+(+sl.value).toFixed(decs(st))); inp.dispatchEvent(new Event('input')); };
    sl.addEventListener('input', () => { put(); paintSl(f.k); });
    sl.addEventListener('keydown', (e) => { if (e.key === 'Enter') calculate(); });
    const vb = $('v_' + f.k);
    vb.addEventListener('focus', () => vb.select());
    vb.addEventListener('blur', () => {
      const t = vb.value.trim().replace(',', '.'), x = Number(t);
      if (!vb.dataset.skip && t !== '' && t !== '?' && isFinite(x)) { inp.value = String(+Math.min(mx, Math.max(mn, x)).toFixed(4)); inp.dispatchEvent(new Event('input')); }
      vb.dataset.skip = ''; paintSl(f.k);
    });
    vb.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); vb.blur(); } else if (e.key === 'Escape') { vb.dataset.skip = '1'; vb.blur(); } });
    $('q_' + f.k).addEventListener('click', () => { if (inp.value.trim() === '') put(); else { inp.value = ''; inp.dispatchEvent(new Event('input')); } paintSl(f.k); Snd.sfx('click'); });
  });
  syncSliders();
}
const _bd = buildDrawer;
buildDrawer = function (id) {
  _bd(id); makeSliders(id);
  if (id === 'cannon') $('newTarget').addEventListener('click', syncSliders);
};
$('btnExample').addEventListener('click', syncSliders);
$('btnClear').addEventListener('click', syncSliders);

const rv = (id, k) => { const [mn, mx, st] = SLD[id][k], g = st * Math.max(1, Math.round((mx - mn) / st / 40)); return +(mn + Math.round((Math.random() * (mx - mn)) / g) * g).toFixed(3); };
const some = (list, n) => list.slice().sort(() => Math.random() - 0.5).slice(0, n);
const RAND = {
  ferris: () => { const v = { r: rv('ferris', 'r') }; some(['s', 't', 'v', 'a', 'u'], 3).forEach((k) => { v[k] = rv('ferris', k); }); return v; },
  drop: () => { const v = {}; some(['s', 't', 'v', 'a', 'u'], 3).forEach((k) => { v[k] = rv('drop', k); }); return v; },
  coaster: () => { const v = { ang: rv('coaster', 'ang'), mu: rv('coaster', 'mu') }; some(['s', 't', 'v', 'u'], 2).forEach((k) => { v[k] = rv('coaster', k); }); return v; },
  cannon: () => { const v = { ang: rv('cannon', 'ang'), h0: pick([0, 0, rv('cannon', 'h0')]) }; if (Math.random() < 0.5) v.rng = rv('cannon', 'rng'); else v.v0 = rv('cannon', 'v0'); return v; },
  carousel: () => { const v = { r: rv('carousel', 'r'), m: rv('carousel', 'm') }; some(['s', 't', 'v', 'a', 'u'], 3).forEach((k) => { v[k] = rv('carousel', k); }); return v; },
  pirate: () => { const v = { L: rv('pirate', 'L') }; some(['s', 't', 'v', 'a', 'u'], 3).forEach((k) => { v[k] = rv('pirate', k); }); return v; },
};
function randomize() {
  if (!cur || !RAND[cur]) return; Snd.start();
  const r = RIDES[cur];
  for (let n = 0; n < 120; n++) {
    const v = RAND[cur](), f = {}; r.fields.forEach((x) => { f[x.k] = x.k in v ? v[x.k] : null; });
    const res = SOLVE[cur](f);
    if (res.error || (res.warns && res.warns.length) || !res.rows.every((x) => !isFinite(x.val) || Math.abs(x.val) < 500)) continue;
    if (['ferris', 'drop', 'coaster', 'carousel', 'pirate'].includes(cur) && res.rows.some((x) => x.val < -1e-9)) continue;
    r.fields.forEach((x) => { const el = $('f_' + x.k); el.value = x.k in v ? String(v[x.k]) : ''; el.dispatchEvent(new Event('input')); });
    syncSliders(); sim = null; lastRes = null; Snd.sfx('pick');
    say('Random settings loaded! Press Amuse Me Physics to watch it run.'); return;
  }
}
$('btnRand').addEventListener('click', randomize);

/* ===== v6: class notation (Vf = Vi + at, ωf = ωi + αt) ===== */
let KMODE = 'lin';
const KSYM = { lin: { s: 'Δx', u: 'Vi', v: 'Vf', a: 'a', t: 't' }, rot: { s: 'Δθ', u: 'ωi', v: 'ωf', a: 'α', t: 't' } };
const KUNIT = { lin: { s: 'm', u: 'm/s', v: 'm/s', a: 'm/s²', t: 's' }, rot: { s: 'rad', u: 'rad/s', v: 'rad/s', a: 'rad/s²', t: 's' } };
const CEQ = [
  { t: '{v} = {u} + {a}·{t}', v: ['v', 'u', 'a', 't'] }, { t: '{s} = {u}·{t} + ½·{a}·{t}²', v: ['s', 'u', 't', 'a'] },
  { t: '{v}² = {u}² + 2·{a}·{s}', v: ['v', 'u', 'a', 's'] }, { t: '{s} = ½·({u} + {v})·{t}', v: ['s', 'u', 'v', 't'] },
];
function kinStep(n, vals, res) {
  const sy = KSYM[KMODE], un = KUNIT[KMODE], known = Object.keys(vals).filter((k) => vals[k] !== null);
  const eq = CEQ.find((e) => e.v.includes(n) && e.v.every((k) => k === n || known.includes(k))); if (!eq) return null;
  const pn = (x) => (x < 0 ? `(${f2(x)})` : f2(x));
  const show = (tpl, plug) => tpl.replace(/\{(\w)\}/g, (m, k) => (plug && k !== n ? pn(vals[k]) : sy[k])).replace(/·/g, plug ? '×' : ' ');
  const extra = n === 't' && eq === CEQ[1] ? ' (a quadratic in t: solve for the positive t)' : '';
  return `${show(eq.t, false)} → ${show(eq.t, true)}${extra}, so ${sy[n]} = ${f2(res)} ${un[n]}`;
}
/* Ferris wheel sandbox is now rotational */
Object.assign(RIDES.ferris, {
  blurb: 'The wheel speeds up with angular acceleration α. Give the radius and 3 of the 5 angular measurements.',
  fields: [
    { k: 'r', label: 'Wheel radius r', unit: 'm', def: '12' }, { k: 's', label: 'Angle turned Δθ', unit: 'rad' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final angular velocity ωf', unit: 'rad/s' }, { k: 'a', label: 'Angular acceleration α', unit: 'rad/s²' }, { k: 'u', label: 'Initial angular velocity ωi', unit: 'rad/s' },
  ],
  example: { r: '12', u: '0', a: '0.03', t: '25' },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['ωf', '0.00', 'rad/s', K.green], ['Δθ', '0.0', 'rad', K.ink]];
    const d = st.data;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['ωf', fix(kinV(d, st.tau) / d.r, 2), 'rad/s', K.green], ['Δθ', fix(kinS(d, st.tau) / d.r, 1), 'rad', K.ink]];
  },
});
SOLVE.ferris = function (i) {
  if (i.r === null || i.r <= 0) return { error: 'Give the wheel a radius r above zero.' };
  KMODE = 'rot'; let res; try { res = solveKin(i); } finally { KMODE = 'lin'; }
  if (res.error) return res;
  const v = res.vals, r = i.r, FR = [['s', 'Angle turned Δθ', 'rad'], ['t', 'Time t', 's'], ['v', 'Final angular velocity ωf', 'rad/s'], ['a', 'Angular acceleration α', 'rad/s²'], ['u', 'Initial angular velocity ωi', 'rad/s']];
  const rows = FR.map(([k, label, unit]) => ({ label, unit, val: v[k], calc: res.given.indexOf(k) < 0 })).concat([
    { label: 'Full turns', unit: 'rev', val: v.s / TAU, calc: true }, { label: 'Rim distance Δx = rΔθ', unit: 'm', val: v.s * r, calc: true },
    { label: 'Rim speed V = rωf', unit: 'm/s', val: v.v * r, calc: true }, { label: 'Pull to centre a꜀ = rωf²', unit: 'm/s²', val: r * v.v * v.v, calc: true }]);
  const steps = res.steps.concat([`Δx = rΔθ = ${f2(r)}×${f2(v.s)} = ${f2(v.s * r)} m (${f2(v.s / TAU)} turns)`, `V = rωf = ${f2(r)}×${f2(v.v)} = ${f2(v.v * r)} m/s`, `a꜀ = rωf² = ${f2(r)}×${f2(v.v)}² = ${f2(r * v.v * v.v)} m/s²`]);
  return { rows, steps, warns: res.warns, data: { r, u: v.u * r, a: v.a * r, s: v.s * r }, T: v.t };
};

/* ===== v7: carousel sandbox is rotational kinematics too (matches its challenges) ===== */
Object.assign(RIDES.carousel, {
  blurb: 'The carousel speeds up with angular acceleration α. Give the radius and 3 of the 5 angular measurements.',
  fields: [
    { k: 'r', label: 'Horse ring radius r', unit: 'm', def: '6' }, { k: 's', label: 'Angle turned Δθ', unit: 'rad' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final angular velocity ωf', unit: 'rad/s' }, { k: 'a', label: 'Angular acceleration α', unit: 'rad/s²' },
    { k: 'u', label: 'Initial angular velocity ωi', unit: 'rad/s' }, { k: 'm', label: 'Rider mass m', unit: 'kg', def: '40' },
  ],
  example: { r: '6', u: '0', a: '0.2', t: '8', m: '40' },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['ωf', '0.00', 'rad/s', K.green], ['Δθ', '0.0', 'rad', K.ink]];
    const d = st.data;
    return [['t', fix(st.tau, 1), 's', K.yellow], ['ωf', fix(d.w0 + d.al * st.tau, 2), 'rad/s', K.green], ['Δθ', fix(d.w0 * st.tau + 0.5 * d.al * st.tau * st.tau, 1), 'rad', K.ink]];
  },
  scene(c, st, now) {
    const d = st && st.data;
    drawCarousel(c, 192, GROUND - 4, 1.3, st ? d.w0 * st.tau + 0.5 * d.al * st.tau * st.tau : now * 0.6, !!st);
    if (st) ptxt(c, `ω ${fix(d.w0 + d.al * st.tau, 2)} rad/s`, W - 8, 8, K.pink, 8, 'right');
  },
});
SOLVE.carousel = function (i) {
  if (i.r === null || i.r <= 0) return { error: 'Give the carousel a radius r above zero.' };
  KMODE = 'rot'; let res; try { res = solveKin(i); } finally { KMODE = 'lin'; }
  if (res.error) return res;
  const v = res.vals, r = i.r, m = i.m === null ? 40 : i.m, ac = r * v.v * v.v, F = m * ac, Tf = v.v > 0 ? TAU / v.v : null;
  const FR = [['s', 'Angle turned Δθ', 'rad'], ['t', 'Time t', 's'], ['v', 'Final angular velocity ωf', 'rad/s'], ['a', 'Angular acceleration α', 'rad/s²'], ['u', 'Initial angular velocity ωi', 'rad/s']];
  const rows = FR.map(([k, label, unit]) => ({ label, unit, val: v[k], calc: res.given.indexOf(k) < 0 })).concat([
    { label: 'Full turns', unit: 'rev', val: v.s / TAU, calc: true }, { label: 'Rim distance Δx = rΔθ', unit: 'm', val: v.s * r, calc: true },
    { label: 'Rim speed V = rωf', unit: 'm/s', val: v.v * r, calc: true }, { label: 'Pull to centre a꜀ = rωf²', unit: 'm/s²', val: ac, calc: true },
    { label: 'Force on rider F = m a꜀', unit: 'N', val: F, calc: true }].concat(Tf ? [{ label: 'Time for one turn at ωf', unit: 's', val: Tf, calc: true }] : []));
  const steps = res.steps.concat([`Δx = rΔθ = ${f2(r)}×${f2(v.s)} = ${f2(v.s * r)} m (${f2(v.s / TAU)} turns)`, `V = rωf = ${f2(r)}×${f2(v.v)} = ${f2(v.v * r)} m/s`,
    `a꜀ = rωf² = ${f2(r)}×${f2(v.v)}² = ${f2(ac)} m/s²`, `F = m a꜀ = ${f2(m)}×${f2(ac)} = ${f2(F)} N`]);
  return { rows, steps, warns: res.warns, data: { r, w0: v.u, al: v.a }, T: v.t };
};

/* ===== v10: prize banner ===== */
function updatePrizeBar() {
  const nx = PRIZES.filter((p) => !owns(p.id)).sort((a, b) => a.c - b.c)[0];
  const sub = !nx ? 'You own every prize! Try the Lucky Wheel at the booth.' : Save.tickets >= nx.c ? `You can afford the ${nx.n} ${nx.e} now. Tap to open the Ticket Booth!` : `${nx.c - Save.tickets} more 🎟 to win the ${nx.n} ${nx.e}. Tap to peek at the prizes.`;
  $('prizeBar').innerHTML = `<span class="pb1">🎁 Try solving to win a prize!</span><span class="pb2">${esc(sub)}</span>`;
}
const _rt = refreshTix; refreshTix = function () { _rt(); updatePrizeBar(); };
const _nc3 = newChallenge; newChallenge = function () { _nc3(); updatePrizeBar(); };
$('prizeBar').addEventListener('click', () => { Snd.start(); Snd.sfx('click'); openBooth(); });
updatePrizeBar();

/* ===== v13: START is locked until the character is customized ===== */
Save.customized = Save.customized || ((Save.me.name !== 'Player' || Save.solved > 0 || Save.owned.length > 0) ? 1 : 0);
function syncStart() {
  const ok = !!Save.customized;
  $('startBtn').textContent = ok ? 'START' : '🔒 START'; $('startBtn').classList.toggle('locked', !ok);
  $('menuMe').classList.toggle('attn', !ok);
  document.querySelector('.menu .note').textContent = ok ? 'Tap START to open the park (sound on)' : 'Create your character to unlock START!';
}
syncStart();

/* ===== v16: Pirate Ship sandbox is rotational kinematics too (matches its challenges) ===== */
Object.assign(RIDES.pirate, {
  blurb: 'The ship swings with constant angular acceleration α. Give the arm length L and 3 of the 5 angular measurements.',
  fields: [
    { k: 'L', label: 'Arm length L', unit: 'm', def: '12' }, { k: 's', label: 'Angle swept Δθ', unit: 'rad' }, { k: 't', label: 'Time t', unit: 's' },
    { k: 'v', label: 'Final angular velocity ωf', unit: 'rad/s' }, { k: 'a', label: 'Angular acceleration α', unit: 'rad/s²' }, { k: 'u', label: 'Initial angular velocity ωi', unit: 'rad/s' },
  ],
  example: { L: '12', u: '0', a: '0.4', t: '2' },
  live(st) {
    if (!st) return [['t', '0.0', 's', K.yellow], ['ωf', '0.00', 'rad/s', K.green], ['Δθ', '0.00', 'rad', K.ink]];
    const d = st.data, ta = st.tau;
    return [['t', fix(ta, 1), 's', K.yellow], ['ωf', fix(d.w0 + d.al * ta, 2), 'rad/s', K.green], ['Δθ', fix(d.w0 * ta + 0.5 * d.al * ta * ta, 2), 'rad', K.ink]];
  },
  scene(c, st, now) {
    const d = st && st.data, half = d ? d.th / 2 : 0.7;
    const th = st ? -half + d.w0 * st.tau + 0.5 * d.al * st.tau * st.tau : 0.7 * Math.cos(now * 1.2);
    drawPirate(c, 192, GROUND - 2, 1.0, th, half, st);
    if (st) ptxt(c, `ω ${fix(d.w0 + d.al * st.tau, 2)} rad/s`, W - 8, 8, K.pink, 8, 'right');
  },
});
SOLVE.pirate = function (i) {
  if (i.L === null || i.L <= 0) return { error: 'Give the ship an arm length L above zero.' };
  KMODE = 'rot'; let res; try { res = solveKin(i); } finally { KMODE = 'lin'; }
  if (res.error) return res;
  const v = res.vals, L = i.L;
  if (v.s > 2.4) return { error: 'That swing is too big for the ship: it sweeps more than 2.4 rad (about 137°). Try a smaller angle or time.' };
  const FR = [['s', 'Angle swept Δθ', 'rad'], ['t', 'Time t', 's'], ['v', 'Final angular velocity ωf', 'rad/s'], ['a', 'Angular acceleration α', 'rad/s²'], ['u', 'Initial angular velocity ωi', 'rad/s']];
  const rows = FR.map(([k, label, unit]) => ({ label, unit, val: v[k], calc: res.given.indexOf(k) < 0 })).concat([
    { label: 'Angle in degrees', unit: '°', val: (v.s * 180) / Math.PI, calc: true }, { label: 'Arc length Δx = LΔθ', unit: 'm', val: L * v.s, calc: true },
    { label: 'Ship speed V = Lωf', unit: 'm/s', val: L * v.v, calc: true }, { label: 'Pull to centre a꜀ = Lωf²', unit: 'm/s²', val: L * v.v * v.v, calc: true }]);
  const steps = res.steps.concat([`Δx = LΔθ = ${f2(L)}×${f2(v.s)} = ${f2(L * v.s)} m (${f2((v.s * 180) / Math.PI)}°)`, `V = Lωf = ${f2(L)}×${f2(v.v)} = ${f2(L * v.v)} m/s`, `a꜀ = Lωf² = ${f2(L)}×${f2(v.v)}² = ${f2(L * v.v * v.v)} m/s²`]);
  return { rows, steps, warns: res.warns, data: { L, w0: v.u, al: v.a, th: v.s }, T: v.t };
};

initOutlines();
setScreen('menu');
requestAnimationFrame(frame);
