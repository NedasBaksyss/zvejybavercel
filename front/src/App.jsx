import { useState, useEffect, useRef } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

/* ==========================================================================
   THE COMPONENT
   ========================================================================== */
function App() {
  const [count, setCount] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    const stop = startMenu(rootRef.current)
    return stop
  }, [])

  return (
    <div className="zv" ref={rootRef}>
      <style>{CSS}</style>

      <div id="stage">
        <canvas id="scene" width="480" height="270" />

        <div id="ui">

          <section className="screen active" id="s-title">
            <div id="logo">
              <div className="word" id="logo-word" />
              <div className="sub" id="logo-sub" />
            </div>
            <nav id="menu" />
            <p id="who" hidden />
          </section>

          <section className="screen" id="s-auth">
            <div className="panel">
              <h2 id="auth-title" />
              <div className="tabs">
                <button className="tab" type="button" data-mode="login" aria-selected="true" />
                <button className="tab" type="button" data-mode="register" aria-selected="false" />
              </div>
              <div className="field">
                <span id="lbl-user" />
                <input id="f-user" autoComplete="username" maxLength={20} />
              </div>
              <div className="field">
                <span id="lbl-pass" />
                <input id="f-pass" type="password" autoComplete="current-password" maxLength={40} />
              </div>
              <div className="field" id="f-mail-wrap" hidden>
                <span id="lbl-mail" />
                <input id="f-mail" type="email" autoComplete="email" maxLength={60} />
              </div>
              <p className="msg" id="auth-msg" />
              <button className="btn" type="button" id="auth-go" />
              <button className="btn ghost" type="button" id="auth-out" hidden />
            </div>
            <p className="hint" id="hint-auth" />
          </section>

          <section className="screen" id="s-settings">
            <div className="panel">
              <h2 id="set-title" />
              <div id="opts" />
            </div>
            <p className="hint" id="hint-set" />
          </section>

          <section className="screen" id="s-credits">
            <div className="panel credits">
              <h2 id="cred-title" />
              <p id="cred-body" />
            </div>
            <p className="hint" id="hint-cred" />
          </section>

          <section className="screen" id="loading">
            <div className="box">
              <p className="what" id="load-what" />
              <div className="bar"><i id="load-bar" /></div>
              <p className="tip" id="load-tip" />
            </div>
          </section>

          <section className="screen" id="s-bye">
            <div className="panel">
              <h2 id="bye-title" />
              <p id="bye-body" />
            </div>
          </section>

        </div>
        <span id="build">v0.2.0</span>
      </div>
    </div>
  )
}

/* ==========================================================================
   STYLES
   Everything that used to hang off <body> now hangs off .zv, so the menu
   cannot fight with Vite's default index.css / App.css.
   ========================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap');

.zv{
  --ink:#0d0b18;
  --pale:#ffdca8;
  --gold:#f2b45c;
  --ember:#e0765a;
  --mist:#8fa8c8;
  --dim:#6b5a7a;
  --ok:#7fbf7f;
  --bad:#d4574e;
  --scale:1;

  position:fixed;inset:0;z-index:0;
  background:#07060f;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  text-align:left;
  font-family:'Pixelify Sans',ui-monospace,'DejaVu Sans Mono',monospace;
  color:var(--pale);
}
.zv *{box-sizing:border-box;margin:0;padding:0}

/* Glyph guard: if the pixel face cannot draw Z/e/u with Lithuanian
   diacritics, the whole UI swaps to a monospace face that can. */
.zv.nopix,.zv.nopix #logo .word{font-family:ui-monospace,'DejaVu Sans Mono','Courier New',monospace}

.zv #stage{
  position:relative;
  width:480px;height:270px;
  transform:scale(var(--scale));
  transform-origin:center center;
  image-rendering:pixelated;
  box-shadow:0 0 0 1px #241f33;
  overflow:hidden;
}
.zv #stage.stretch{image-rendering:auto}
.zv canvas{position:absolute;inset:0;width:480px;height:270px;image-rendering:pixelated;display:block}

.zv #ui{position:absolute;inset:0;z-index:2}
.zv .screen{position:absolute;inset:0;display:none;padding:18px 22px}
.zv .screen.active{display:block}

.zv #logo{position:absolute;top:32px;left:0;right:0;text-align:center;pointer-events:none}
.zv #logo .word{
  font-size:34px;font-weight:700;line-height:1;letter-spacing:2px;
  color:var(--pale);
  text-shadow:0 3px 0 var(--ember),0 4px 0 #7a2e3a;
}
.zv #logo .sub{margin-top:6px;font-size:9px;letter-spacing:5px;color:var(--mist);opacity:.8}

.zv #menu{position:absolute;left:46px;bottom:44px;display:flex;flex-direction:column;gap:3px}
.zv .item{
  position:relative;display:flex;align-items:center;gap:8px;
  font-size:15px;line-height:1;padding:3px 6px 3px 0;
  color:#c9bcd6;background:none;border:0;font-family:inherit;cursor:pointer;text-align:left;
}
.zv .item .bob{
  width:7px;height:7px;background:var(--ember);
  box-shadow:0 -3px 0 0 var(--pale);
  opacity:0;transform:translateX(-3px);
  transition:opacity .09s steps(2),transform .09s steps(2);
}
.zv .item[aria-selected="true"]{color:var(--gold)}
.zv .item[aria-selected="true"] .bob{opacity:1;transform:translateX(0)}
.zv .item[disabled]{color:#4a4257;cursor:default}
.zv .item[disabled] .bob{background:#4a4257;box-shadow:0 -3px 0 0 #4a4257}
.zv .item:focus-visible{outline:2px solid var(--pale);outline-offset:2px}

.zv #who{position:absolute;left:46px;bottom:22px;font-size:9px;color:var(--mist)}
.zv #who b{color:var(--gold);font-weight:500}

.zv .panel{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:288px;max-height:250px;
  background:rgba(13,11,24,.9);border:2px solid #3b3350;
  padding:9px 12px 11px;
}
.zv .panel h2{
  font-size:12px;font-weight:600;color:var(--gold);
  margin-bottom:7px;padding-bottom:4px;border-bottom:1px solid #3b3350;
}
.zv .row{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:4px 0;font-size:11px;color:#c9bcd6;
}
.zv .row.focused{color:var(--gold)}
.zv .row .label{white-space:nowrap}

.zv .slider{display:flex;gap:2px;cursor:pointer}
.zv .slider i{width:8px;height:10px;background:#332c46;display:block}
.zv .slider i.on{background:var(--gold)}
.zv .slider i.on:nth-child(n+9){background:var(--ember)}

.zv .cycle{
  display:flex;align-items:center;gap:7px;
  background:#221d33;border:1px solid #3b3350;
  padding:2px 6px;font-size:11px;color:var(--pale);
  cursor:pointer;font-family:inherit;
}
.zv .cycle .arw{color:var(--dim);font-size:9px}
.zv .cycle .val{min-width:96px;text-align:center}

.zv .tabs{display:flex;gap:4px;margin-bottom:7px}
.zv .tab{
  flex:1;font-family:inherit;font-size:10px;padding:3px;cursor:pointer;
  background:#221d33;border:1px solid #3b3350;color:#8d82a3;
}
.zv .tab[aria-selected="true"]{background:#3b3350;color:var(--pale)}
.zv .field{margin-bottom:5px}
.zv .field span{display:block;font-size:8px;color:var(--mist);margin-bottom:2px}
.zv .field input{
  width:100%;font-family:inherit;font-size:11px;padding:3px 6px;
  background:#0f0d1c;color:var(--pale);border:1px solid #3b3350;
}
.zv .field input:focus{outline:none;border-color:var(--gold)}
.zv .msg{font-size:8px;min-height:12px;margin:3px 0 5px;color:var(--bad);line-height:1.4}
.zv .msg.ok{color:var(--ok)}
.zv .btn{
  width:100%;font-family:inherit;font-size:11px;padding:4px;cursor:pointer;
  background:var(--ember);color:#1a0f14;border:0;border-bottom:3px solid #7a2e3a;
}
.zv .btn:active{transform:translateY(1px);border-bottom-width:2px}
.zv .btn[disabled]{background:#4a4257;border-bottom-color:#2b2639;color:#8d82a3;cursor:default}
.zv .btn.ghost{background:#221d33;color:#c9bcd6;border-bottom-color:#3b3350;margin-top:5px}

.zv .hint{position:absolute;bottom:8px;left:22px;font-size:9px;color:var(--dim);text-align:left}
.zv kbd{font-family:inherit;color:var(--mist);border:1px solid #3b3350;padding:0 3px}

.zv .credits p{font-size:11px;line-height:1.75;color:#c9bcd6}
.zv .credits .who{color:var(--gold)}

.zv #loading .box{position:absolute;left:50%;bottom:54px;transform:translateX(-50%);width:264px;text-align:center}
.zv #loading .what{font-size:11px;color:var(--pale);margin-bottom:8px;min-height:13px}
.zv .bar{height:9px;background:#221d33;border:1px solid #3b3350}
.zv .bar i{display:block;height:100%;width:0;background:var(--gold);transition:width .18s steps(6)}
.zv #loading .tip{margin-top:10px;font-size:9px;color:var(--mist);line-height:1.6}

.zv #s-bye .panel{text-align:center}
.zv #s-bye p{font-size:11px;line-height:1.8;color:#c9bcd6}

.zv #build{position:absolute;right:7px;bottom:6px;font-size:8px;color:#4a4257;z-index:3}
@media (prefers-reduced-motion:reduce){.zv .item .bob{transition:none}}
`

/* ==========================================================================
   1. TEXT — every visible string lives here, in both languages.
   ========================================================================== */
const T = {
  LT: {
    sub: 'TYLUS EŽERAS',
    play: 'Nauja kelionė', cont: 'Tęsti', account: 'Žvejo kortelė',
    settings: 'Nustatymai', credits: 'Apie', quit: 'Išeiti',
    signedIn: 'Prisijungęs:',
    music: 'Muzika', sfx: 'Garsai', quality: 'Kokybė', scaling: 'Vaizdo mastelis', lang: 'Kalba',
    q_low: 'Žema', q_med: 'Vidutinė', q_high: 'Aukšta',
    sc_int: 'Sveiki kartotiniai', sc_str: 'Per visą ekraną',
    authTitle: 'Žvejo kortelė', setTitle: 'Nustatymai', credTitle: 'Apie', byeTitle: 'Iki',
    tabLogin: 'Prisijungti', tabReg: 'Registruotis',
    fUser: 'Slapyvardis', fPass: 'Slaptažodis', fMail: 'El. paštas',
    btnLogin: 'Prisijungti', btnReg: 'Sukurti paskyrą', btnOut: 'Atsijungti', working: 'Palauk…',
    hintBack: 'Esc grįžti',
    hintSet: '↑↓ rinktis · ←→ keisti · Esc grįžti',
    credBody: '3JS-3 komandos kursinis darbas.\nŽvejybos simuliatorius trijų matmenų ežere.\n\nVariklis: three.js\nServeris: Node · MongoDB\nGrafika: piešta ranka, 480×270',
    byeBody: 'Naršyklė neleidžia programai uždaryti kortelės, kurios ji pati neatidarė.\nUždaryk ją ranka: Ctrl+W.\n\nAčiū, kad žvejojai.',
    errUser: 'Slapyvardis – bent 3 simboliai',
    errPass: 'Slaptažodis – bent 6 simboliai',
    errMail: 'Neteisingas el. pašto adresas',
    errTaken: 'Toks slapyvardis jau užimtas',
    errNoUser: 'Tokio žvejo nėra. Pirma registruokis.',
    errWrong: 'Neteisingas slaptažodis',
    welcome: u => `Sveikas, ${u}`,
    created: u => `Paskyra sukurta. Sveikas, ${u}`,
    steps: ['Ruošiamas ežeras', 'Kraunami modeliai', 'Leidžiamas vanduo', 'Paleidžiamos žuvys', 'Rišamas kabliukas'],
    ready: 'Pasiruošęs',
    tips: ['Karšiai geriau kimba auštant, sekliose vietose.',
      'Lietus drumsčia vandenį – kvapas svarbesnis už spalvą.',
      'Per stipriai sukant valą, jis trūksta. Leisk žuviai pavargti.']
  },
  EN: {
    sub: 'THE QUIET LAKE',
    play: 'New trip', cont: 'Continue', account: 'Angler card',
    settings: 'Settings', credits: 'About', quit: 'Quit',
    signedIn: 'Signed in:',
    music: 'Music', sfx: 'Sound', quality: 'Quality', scaling: 'Scaling', lang: 'Language',
    q_low: 'Low', q_med: 'Medium', q_high: 'High',
    sc_int: 'Whole multiples', sc_str: 'Fill the screen',
    authTitle: 'Angler card', setTitle: 'Settings', credTitle: 'About', byeTitle: 'Goodbye',
    tabLogin: 'Sign in', tabReg: 'Register',
    fUser: 'Username', fPass: 'Password', fMail: 'Email',
    btnLogin: 'Sign in', btnReg: 'Create account', btnOut: 'Sign out', working: 'Working…',
    hintBack: 'Esc to go back',
    hintSet: '↑↓ choose · ←→ change · Esc back',
    credBody: 'A coursework project by team 3JS-3.\nA fishing simulator on a lake in three dimensions.\n\nEngine: three.js\nServer: Node · MongoDB\nArt: drawn by hand, 480×270',
    byeBody: 'A browser will not let a page close a tab it did not open itself.\nClose it by hand: Ctrl+W.\n\nThanks for fishing.',
    errUser: 'Username needs at least 3 characters',
    errPass: 'Password needs at least 6 characters',
    errMail: 'That email address is not valid',
    errTaken: 'That username is taken',
    errNoUser: 'No angler by that name. Register first.',
    errWrong: 'Wrong password',
    welcome: u => `Welcome back, ${u}`,
    created: u => `Account created. Welcome, ${u}`,
    steps: ['Preparing the lake', 'Loading models', 'Filling the water', 'Releasing the fish', 'Tying the hook'],
    ready: 'Ready',
    tips: ['Bream bite best at dawn, in the shallows.',
      'Rain clouds the water — scent beats colour.',
      'Reel too hard and the line snaps. Let the fish tire.']
  }
}

/* ==========================================================================
   THE MENU ENGINE
   Same imperative code as the original page, wrapped so it can be started
   and — crucially — stopped again when React unmounts the component.
   Returns a cleanup function.
   ========================================================================== */
function startMenu(root) {
  let alive = true
  let raf = 0
  const timers = new Set()
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); if (alive) fn() }, ms)
    timers.add(id)
    return id
  }

  const $ = id => root.querySelector('#' + id)
  const t = () => T[Store.get('lang')]

  /* ---- 2. SETTINGS STORE -------------------------------------------------
     Values are stored as CODES ("high", "integer"), never as display text. */
  const Store = (() => {
    const defaults = { music: 6, sfx: 9, quality: 'high', scaling: 'integer', lang: 'LT' }
    let mem = { ...defaults }
    const KEY = 'zvejyba.settings'
    return {
      all: () => ({ ...mem }),
      get: k => mem[k],
      set(k, v) {
        mem[k] = v
        try { localStorage.setItem(KEY, JSON.stringify(mem)) } catch (e) { /* private mode */ }
      },
      load() {
        try { mem = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
        catch (e) { mem = { ...defaults } }
        return this.all()
      }
    }
  })()
  Store.load()

  const QP = {
    low: { stars: 0, mist: 0, reflect: false, birds: false, roadStep: 3, crestStep: 7, vignette: false, sunGlow: false },
    med: { stars: 45, mist: 2, reflect: true, birds: true, roadStep: 2, crestStep: 5, vignette: true, sunGlow: true },
    high: { stars: 96, mist: 4, reflect: true, birds: true, roadStep: 1, crestStep: 4, vignette: true, sunGlow: true }
  }
  const Q = () => QP[Store.get('quality')]

  /* ---- 3. SCALER --------------------------------------------------------- */
  const BASE_W = 480, BASE_H = 270
  const stage = $('stage')
  function fit() {
    const w = innerWidth - 16, h = innerHeight - 16
    const stretch = Store.get('scaling') === 'stretch'
    let s = Math.min(w / BASE_W, h / BASE_H)
    if (!stretch) s = Math.max(1, Math.floor(s))
    stage.classList.toggle('stretch', stretch)
    root.style.setProperty('--scale', s)
  }
  addEventListener('resize', fit)

  /* ---- 4. SOUND ---------------------------------------------------------- */
  const Sound = (() => {
    let actx = null
    const vol = () => Store.get('sfx') / 12
    function blip(freq, dur, type = 'square') {
      if (!alive || vol() <= 0) return
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)()
        if (actx.state === 'suspended') actx.resume()
        const o = actx.createOscillator(), g = actx.createGain()
        o.type = type; o.frequency.value = freq
        g.gain.setValueAtTime(0.06 * vol(), actx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur)
        o.connect(g).connect(actx.destination)
        o.start(); o.stop(actx.currentTime + dur)
      } catch (e) { /* autoplay policy */ }
    }
    return {
      move: () => blip(420, .05),
      confirm: () => { blip(620, .06); later(() => blip(880, .09), 55) },
      back: () => blip(240, .08),
      deny: () => blip(130, .14, 'sawtooth'),
      tick: () => blip(700, .03),
      close: () => { try { actx && actx.close() } catch (e) {} }
    }
  })()

  /* ---- 5. SCENE ---------------------------------------------------------- */
  const cv = $('scene')
  const ctx = cv.getContext('2d')
  ctx.imageSmoothingEnabled = false

  const HORIZON = 148, SUN_X = 322
  const P = {
    night: [26, 24, 58], deep: [46, 33, 87], mauve: [91, 58, 107],
    rose: [164, 80, 107], ember: [224, 118, 90], gold: [242, 180, 92], pale: [255, 220, 168]
  }
  const SKY = [[0, P.night], [.34, P.deep], [.56, P.mauve], [.74, P.rose], [.88, P.ember], [.97, P.gold], [1, P.pale]]
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]

  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`
  const mix = (a, b, f) => [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f)
  ]
  function skyAt(v) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const [p0, c0] = SKY[i], [p1, c1] = SKY[i + 1]
      if (v <= p1) return { lo: c0, hi: c1, f: (v - p0) / (p1 - p0) }
    }
    return { lo: P.pale, hi: P.pale, f: 0 }
  }
  let seed = 1337
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  function bake(w, h, draw) {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const x = c.getContext('2d')
    x.imageSmoothingEnabled = false
    draw(x)
    return c
  }
  function flip(src) {
    return bake(src.width, src.height, x => {
      x.save(); x.translate(0, src.height); x.scale(1, -1)
      x.drawImage(src, 0, 0); x.restore()
    })
  }

  let skyLayer
  function bakeSky() {
    const q = Q()
    seed = 1337
    skyLayer = bake(BASE_W + 20, HORIZON + 4, x => {
      for (let y = 0; y < HORIZON + 4; y++) {
        const { lo, hi, f } = skyAt(Math.min(1, y / HORIZON))
        for (let px = 0; px < BASE_W + 20; px++) {
          x.fillStyle = rgb(f > BAYER[y & 3][px & 3] / 16 ? hi : lo)
          x.fillRect(px, y, 1, 1)
        }
      }
      for (let i = 0; i < q.stars; i++) {
        const sx = Math.floor(rnd() * (BASE_W + 20)), sy = Math.floor(rnd() * 80)
        if (rnd() > 1 - sy / 88) continue
        x.fillStyle = rnd() > .7 ? '#ffdca8' : '#fff4d8'
        x.fillRect(sx, sy, 1, 1)
      }
      const cy = HORIZON - 6, r = 17
      if (q.sunGlow) {
        for (let gy = cy - 46; gy < cy + 46; gy++) {
          for (let gx = SUN_X - 46 + 10; gx < SUN_X + 46 + 10; gx++) {
            if (gx < 0 || gx >= BASE_W + 20 || gy < 0 || gy >= HORIZON + 4) continue
            const d = Math.hypot(gx - SUN_X - 10, gy - cy)
            if (d < r || d > 46) continue
            const s = 1 - (d - r) / (46 - r)
            if (s * s * 0.8 > BAYER[gy & 3][gx & 3] / 16) {
              x.fillStyle = rgb(mix(P.ember, P.gold, s))
              x.fillRect(gx, gy, 1, 1)
            }
          }
        }
      }
      for (let dy = -r; dy <= r; dy++) {
        const w = Math.floor(Math.sqrt(r * r - dy * dy))
        x.fillStyle = rgb(mix(P.pale, P.gold, (dy + r) / (2 * r)))
        x.fillRect(SUN_X - w + 10, cy + dy, w * 2, 1)
      }
    })
  }

  function spruce(x, px, baseY, h, w, col) {
    x.fillStyle = col
    for (let i = 0; i < h; i++) {
      let wd = Math.max(1, Math.round(w * (i / h)))
      if (i % 5 === 0) wd += 1
      if (i > h - 4) wd = Math.max(1, wd - 2)
      x.fillRect(px - (wd >> 1), baseY - h + i, wd, 1)
    }
  }
  function treeline(baseY, col, minH, maxH, gap, band) {
    return bake(BASE_W + 40, band, x => {
      for (let px = -6; px < BASE_W + 40; px += gap + Math.floor(rnd() * 5))
        spruce(x, px, baseY, minH + Math.floor(rnd() * (maxH - minH)), 8 + Math.floor(rnd() * 7), col)
      x.fillStyle = col
      x.fillRect(0, baseY - 1, BASE_W + 40, band - baseY + 1)
    })
  }
  seed = 4242; const farTrees = treeline(52, '#2a2545', 16, 30, 5, 56)
  seed = 909; const nearTrees = treeline(60, '#141227', 24, 46, 7, 64)
  const treeMirror = flip(nearTrees)

  const DECK_Y = 96
  const dockLayer = bake(BASE_W + 20, 130, x => {
    const INK = '#0b0913', INK2 = '#161327'
    x.fillStyle = INK; x.fillRect(0, DECK_Y, 206, 6)
    x.fillStyle = INK2; for (let px = 4; px < 206; px += 11) x.fillRect(px, DECK_Y, 1, 6)
    for (const px of [26, 92, 158, 194]) {
      x.fillStyle = INK
      x.fillRect(px, DECK_Y + 6, 4, 34)
      x.fillRect(px - 1, DECK_Y + 4, 6, 3)
    }
    const fx = 152, fy = DECK_Y
    x.fillStyle = INK
    x.fillRect(fx + 1, fy - 15, 5, 3)   // crown
    x.fillRect(fx - 1, fy - 12, 8, 1)   // brim
    x.fillRect(fx, fy - 11, 5, 4)       // face
    x.fillRect(fx - 1, fy - 7, 7, 6)    // torso
    x.fillRect(fx - 4, fy - 2, 9, 3)    // legs over the edge
  })
  const dockMirror = flip(dockLayer)

  let vignette
  function bakeVignette() {
    vignette = bake(BASE_W, BASE_H, x => {
      for (let y = 0; y < BASE_H; y++) for (let px = 0; px < BASE_W; px++) {
        const d = Math.hypot((px - 240) / 240, (y - 135) / 135)
        const s = Math.max(0, (d - .55) / .85)
        if (s > BAYER[y & 3][px & 3] / 16) { x.fillStyle = '#06050e'; x.fillRect(px, y, 1, 1) }
      }
    })
  }

  function rebake() { bakeSky(); bakeVignette() }
  rebake()

  function drawWater(tm) {
    const q = Q()
    for (let y = HORIZON; y < BASE_H; y++) {
      const d = (y - HORIZON) / (BASE_H - HORIZON)
      ctx.fillStyle = rgb(mix([46, 60, 102], [12, 15, 32], d))
      ctx.fillRect(0, y, BASE_W, 1)
    }
    for (let y = HORIZON + 1; y < BASE_H; y += q.roadStep + 1) {
      const d = (y - HORIZON) / (BASE_H - HORIZON)
      const n = Math.sin(y * .7 + tm * 1.9) * Math.cos(y * .31 - tm * 1.1)
      const w = Math.max(1, Math.round((3 + d * 46) * (.45 + .55 * Math.abs(n))))
      ctx.globalAlpha = Math.max(0, (1 - d) * .85)
      ctx.fillStyle = rgb(mix(P.gold, P.ember, d))
      ctx.fillRect(Math.round(SUN_X - w / 2 + n * 5), y, w, 1)
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(143,168,200,.30)'
    for (let y = HORIZON + 3; y < BASE_H; y += q.crestStep) {
      const d = (y - HORIZON) / (BASE_H - HORIZON)
      const step = 40 + d * 60, drift = (tm * (8 + d * 26)) % step
      for (let px = -step; px < BASE_W; px += step)
        ctx.fillRect(Math.round(px + drift + Math.sin(y + tm) * 6), y, Math.round(3 + d * 9), 1)
    }
  }

  function drawReflection(img, topY, depth, tm, alpha) {
    if (!Q().reflect) return
    for (let y = 0; y < depth; y++) {
      const fade = 1 - y / depth
      ctx.globalAlpha = alpha * fade * fade
      const wob = Math.sin(y * .5 + tm * 1.6) * (1 + y * .10)
      ctx.drawImage(img, 0, img.height - depth + y, img.width, 1,
        Math.round(-20 + wob), topY + y, img.width, 1)
    }
    ctx.globalAlpha = 1
  }

  function drawMist(tm) {
    const n = Q().mist
    ctx.fillStyle = 'rgba(143,168,200,.10)'
    for (let i = 0; i < n; i++) {
      const y = HORIZON - 16 + i * 7
      const off = ((tm * (5 + i * 3)) % (BASE_W + 160)) - 80
      ctx.fillRect(Math.round(-off), y, 150 + i * 40, 3)
      ctx.fillRect(Math.round(BASE_W - off * .6), y + 2, 120, 2)
    }
  }

  const bobber = { x: 262, y: 188, ring: 0, next: 3 }
  function drawBobber(tm) {
    const y = bobber.y + Math.round(Math.sin(tm * 1.7) * 1.4)
    if (tm > bobber.next) { bobber.ring = .001; bobber.next = tm + 5 + Math.random() * 6 }
    if (bobber.ring > 0) {
      const r = bobber.ring * 26
      ctx.globalAlpha = Math.max(0, .5 - bobber.ring * .5)
      ctx.strokeStyle = '#cfe0f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.ellipse(bobber.x + .5, y + 2.5, r, r * .34, 0, 0, 7); ctx.stroke()
      ctx.globalAlpha = 1
      bobber.ring += .012
      if (bobber.ring > 1) bobber.ring = 0
    }
    ctx.fillStyle = '#d4574e'; ctx.fillRect(bobber.x, y, 3, 3)
    ctx.fillStyle = '#ffdca8'; ctx.fillRect(bobber.x, y - 2, 3, 2)
    return y
  }

  function drawRod(dockX, dockY, bobY) {
    const hx = dockX + 158, hy = dockY + DECK_Y - 8
    let rx = hx, ry = hy
    ctx.fillStyle = '#241c30'
    for (let i = 0; i < 44; i++) { ctx.fillRect(Math.round(rx), Math.round(ry), 1, 1); rx += 1; ry -= .5 - i * .008 }
    ctx.strokeStyle = 'rgba(207,224,240,.45)'; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.round(rx) + .5, Math.round(ry) + .5)
    ctx.quadraticCurveTo((rx + bobber.x) / 2, ry + 14, bobber.x + 1.5, bobY + .5)
    ctx.stroke()
  }

  const birds = { t: -8, y: 44 }
  function drawBirds(tm) {
    if (!Q().birds) return
    if (tm > birds.t + 26) { birds.t = tm; birds.y = 28 + Math.random() * 34 }
    const age = tm - birds.t
    if (age < 0 || age > 16) return
    const bx = -20 + age * 34
    ctx.fillStyle = '#2a2545'
    for (let i = 0; i < 3; i++) {
      const x = bx - i * 13, y = birds.y + i * 5 + Math.sin(tm * 3 + i) * 2
      const f = Math.sin(tm * 7 + i * 1.3) > 0 ? 1 : 0
      ctx.fillRect(Math.round(x), Math.round(y), 2, 1)
      ctx.fillRect(Math.round(x - 2), Math.round(y - f), 2, 1)
      ctx.fillRect(Math.round(x + 2), Math.round(y - f), 2, 1)
    }
  }

  const par = { tx: 0, ty: 0, x: 0, y: 0 }
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect()
    par.tx = ((e.clientX - r.left) / r.width - .5) * 2
    par.ty = ((e.clientY - r.top) / r.height - .5) * 2
  })
  stage.addEventListener('pointerleave', () => { par.tx = 0; par.ty = 0 })

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const t0 = performance.now()
  function frame(now) {
    if (!alive) return
    const tm = (now - t0) / 1000, m = reduced ? 0 : tm
    par.x += (par.tx - par.x) * .06
    par.y += (par.ty - par.y) * .06
    const off = (d, a) => Math.round((a === 'x' ? par.x : par.y) * d)

    ctx.clearRect(0, 0, BASE_W, BASE_H)
    ctx.drawImage(skyLayer, -10 + off(2, 'x'), off(1.5, 'y'))
    ctx.drawImage(farTrees, -20 + off(4, 'x'), 40 + off(2, 'y'))
    drawMist(m)
    ctx.drawImage(nearTrees, -20 + off(7, 'x'), 86 + off(3, 'y'))
    drawWater(m)
    drawReflection(treeMirror, HORIZON, 34, m, .62)
    const dockX = -10 + off(11, 'x'), dockY = 140 + off(5, 'y')
    const bobY = drawBobber(m)
    ctx.drawImage(dockLayer, dockX, dockY)
    drawReflection(dockMirror, dockY + DECK_Y + 6, 16, m, .4)
    drawRod(dockX, dockY, bobY)
    drawBirds(reduced ? -99 : tm)
    if (Q().vignette) ctx.drawImage(vignette, 0, 0)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  /* ---- 6. SCREENS -------------------------------------------------------- */
  const Screens = {}
  let current = null
  const UI = {
    register(n, d) { Screens[n] = d },
    go(n) {
      if (current && Screens[current].exit) Screens[current].exit()
      root.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
      $(Screens[n].el).classList.add('active')
      current = n
      if (Screens[n].enter) Screens[n].enter()
    },
    now: () => current
  }

  /* ---- 7. ACCOUNTS — a working stub. Swap Db for fetch() when Node is up. */
  const Db = new Map()   // username -> {pass, mail}
  const Api = {
    async register(user, pass, mail) {
      await new Promise(r => later(r, 420))
      if (Db.has(user.toLowerCase())) throw new Error(t().errTaken)
      Db.set(user.toLowerCase(), { pass, mail })
      return { user, token: 'dev-' + Math.random().toString(36).slice(2) }
    },
    async login(user, pass) {
      await new Promise(r => later(r, 420))
      const rec = Db.get(user.toLowerCase())
      if (!rec) throw new Error(t().errNoUser)
      if (rec.pass !== pass) throw new Error(t().errWrong)
      return { user, token: 'dev-' + Math.random().toString(36).slice(2) }
    }
  }

  let player = null
  let authMode = 'login'

  /* ---- 8. TITLE ---------------------------------------------------------- */
  const MENU = [
    { id: 'play', key: 'play' },
    { id: 'continue', key: 'cont', needsPlayer: true },
    { id: 'account', key: 'account' },
    { id: 'settings', key: 'settings' },
    { id: 'credits', key: 'credits' },
    { id: 'quit', key: 'quit' }
  ]
  let sel = 0
  const menuEl = $('menu')
  const whoEl = $('who')

  function paintMenu() {
    const L = t()
    menuEl.innerHTML = ''
    MENU.forEach((m, i) => {
      const b = document.createElement('button')
      b.className = 'item'; b.type = 'button'
      b.setAttribute('aria-selected', i === sel)
      if (m.needsPlayer && !player) b.disabled = true
      const bob = document.createElement('span'); bob.className = 'bob'
      const lab = document.createElement('span'); lab.textContent = L[m.key]
      b.append(bob, lab)
      b.addEventListener('pointerenter', () => { if (!b.disabled && sel !== i) { sel = i; paintMenu(); Sound.move() } })
      b.addEventListener('click', () => { b.disabled ? Sound.deny() : (sel = i, choose(m.id)) })
      menuEl.appendChild(b)
    })
    $('logo-word').textContent = '\u017DVEJYBA'
    $('logo-sub').textContent = L.sub
    whoEl.hidden = !player
    if (player) {
      whoEl.textContent = L.signedIn + ' '
      const b = document.createElement('b')
      b.textContent = player.user            // no innerHTML: usernames are user input
      whoEl.appendChild(b)
    }
  }
  function moveSel(d) {
    let i = sel, guard = 0
    do { i = (i + d + MENU.length) % MENU.length; guard++ }
    while (MENU[i].needsPlayer && !player && guard < 20)
    if (i !== sel) { sel = i; paintMenu(); Sound.move() }
  }
  function choose(id) {
    Sound.confirm()
    if (id === 'play' || id === 'continue') startLoading()
    else if (id === 'account') UI.go('auth')
    else if (id === 'settings') UI.go('settings')
    else if (id === 'credits') UI.go('credits')
    else if (id === 'quit') quit()
  }
  UI.register('title', {
    el: 's-title', enter: paintMenu, key(e) {
      if (e.key === 'ArrowUp' || e.key === 'w') moveSel(-1)
      if (e.key === 'ArrowDown' || e.key === 's') moveSel(1)
      if (e.key === 'Enter' || e.key === ' ') choose(MENU[sel].id)
    }
  })

  /* window.close() only works on tabs the script opened. Try, then tell the truth. */
  function quit() {
    Hooks.emit('quit')
    window.close()
    later(() => { if (!document.hidden) UI.go('bye') }, 160)
  }
  UI.register('bye', {
    el: 's-bye', enter() {
      $('bye-title').textContent = t().byeTitle
      $('bye-body').innerText = t().byeBody
    }, key() {}
  })

  /* ---- 9. SETTINGS ------------------------------------------------------- */
  const OPTIONS = [
    { key: 'music', label: 'music', type: 'slider' },
    { key: 'sfx', label: 'sfx', type: 'slider' },
    { key: 'quality', label: 'quality', type: 'cycle', values: ['low', 'med', 'high'], text: v => t()['q_' + v] },
    { key: 'scaling', label: 'scaling', type: 'cycle', values: ['integer', 'stretch'], text: v => v === 'integer' ? t().sc_int : t().sc_str },
    { key: 'lang', label: 'lang', type: 'cycle', values: ['LT', 'EN'], text: v => v }
  ]
  let optSel = 0
  const optsEl = $('opts')

  function paintOpts() {
    const L = t()
    optsEl.innerHTML = ''
    OPTIONS.forEach((o, i) => {
      const row = document.createElement('div')
      row.className = 'row' + (i === optSel ? ' focused' : '')
      const lab = document.createElement('span')
      lab.className = 'label'; lab.textContent = L[o.label]
      row.appendChild(lab)
      if (o.type === 'slider') {
        const s = document.createElement('div'); s.className = 'slider'
        for (let n = 1; n <= 12; n++) {
          const cell = document.createElement('i')
          if (n <= Store.get(o.key)) cell.classList.add('on')
          cell.addEventListener('click', () => { Store.set(o.key, n); optSel = i; paintOpts(); Sound.tick() })
          s.appendChild(cell)
        }
        row.appendChild(s)
      } else {
        const b = document.createElement('button'); b.className = 'cycle'; b.type = 'button'
        const l = document.createElement('span'); l.className = 'arw'; l.textContent = '◀'
        const v = document.createElement('span'); v.className = 'val'; v.textContent = o.text(Store.get(o.key))
        const r = document.createElement('span'); r.className = 'arw'; r.textContent = '▶'
        b.append(l, v, r)
        b.addEventListener('click', () => { optSel = i; cycle(1) })
        row.appendChild(b)
      }
      row.addEventListener('pointerenter', () => { if (optSel !== i) { optSel = i; paintOpts() } })
      optsEl.appendChild(row)
    })
    $('set-title').textContent = L.setTitle
    $('hint-set').textContent = L.hintSet
  }
  function cycle(d) {
    const o = OPTIONS[optSel]
    if (o.type === 'slider') {
      Store.set(o.key, Math.max(0, Math.min(12, Store.get(o.key) + d)))
      Sound.tick()
    } else {
      const vs = o.values
      Store.set(o.key, vs[(vs.indexOf(Store.get(o.key)) + d + vs.length) % vs.length])
      Sound.move()
      if (o.key === 'scaling') fit()
      if (o.key === 'quality') rebake()
      if (o.key === 'lang') applyLang()
    }
    paintOpts()
  }
  UI.register('settings', {
    el: 's-settings', enter: paintOpts, key(e) {
      if (e.key === 'ArrowUp' || e.key === 'w') { optSel = (optSel - 1 + OPTIONS.length) % OPTIONS.length; paintOpts(); Sound.move() }
      if (e.key === 'ArrowDown' || e.key === 's') { optSel = (optSel + 1) % OPTIONS.length; paintOpts(); Sound.move() }
      if (e.key === 'ArrowLeft' || e.key === 'a') cycle(-1)
      if (e.key === 'ArrowRight' || e.key === 'd') cycle(1)
    }
  })

  /* ---- 10. AUTH ---------------------------------------------------------- */
  const msgEl = $('auth-msg')
  const goBtn = $('auth-go')
  const outBtn = $('auth-out')

  root.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      authMode = tab.dataset.mode
      root.querySelectorAll('.tab').forEach(x => x.setAttribute('aria-selected', x === tab))
      $('f-mail-wrap').hidden = authMode === 'login'
      $('f-pass').setAttribute('autocomplete', authMode === 'login' ? 'current-password' : 'new-password')
      msgEl.textContent = ''; msgEl.className = 'msg'
      applyLang()
      Sound.move()
    })
  })

  async function submitAuth() {
    const L = t()
    const user = $('f-user').value.trim()
    const pass = $('f-pass').value
    const mail = $('f-mail').value.trim()
    msgEl.className = 'msg'
    if (user.length < 3) { msgEl.textContent = L.errUser; Sound.deny(); return }
    if (pass.length < 6) { msgEl.textContent = L.errPass; Sound.deny(); return }
    if (authMode === 'register' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      msgEl.textContent = L.errMail; Sound.deny(); return
    }
    goBtn.disabled = true; goBtn.textContent = L.working
    try {
      player = authMode === 'login'
        ? await Api.login(user, pass)
        : await Api.register(user, pass, mail)
      if (!alive) return
      msgEl.className = 'msg ok'
      msgEl.textContent = authMode === 'login' ? L.welcome(player.user) : L.created(player.user)
      Sound.confirm()
      Hooks.emit('login', player)
      paintMenu()
      later(() => UI.go('title'), 800)
    } catch (err) {
      if (!alive) return
      msgEl.textContent = err.message
      Sound.deny()
    } finally {
      if (alive) { goBtn.disabled = false; applyLang() }
    }
  }
  goBtn.addEventListener('click', submitAuth)
  outBtn.addEventListener('click', () => {
    player = null; Sound.back()
    msgEl.className = 'msg'; msgEl.textContent = ''
    $('f-pass').value = ''
    paintMenu(); applyLang()
  })
  root.querySelectorAll('#s-auth input').forEach(i =>
    i.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth() }))

  UI.register('auth', {
    el: 's-auth', enter() {
      applyLang()
      later(() => $('f-user').focus(), 30)
    }, key() {}
  })

  UI.register('credits', {
    el: 's-credits', enter() {
      const L = t()
      $('cred-title').textContent = L.credTitle
      $('cred-body').innerText = L.credBody
      $('hint-cred').textContent = L.hintBack
    }, key() {}
  })

  /* ---- 11. LOADING ------------------------------------------------------- */
  function startLoading() {
    UI.go('loading')
    const L = t()
    const bar = $('load-bar')
    const what = $('load-what')
    const tip = $('load-tip')
    tip.textContent = L.tips[Math.floor(Math.random() * L.tips.length)]
    bar.style.width = '0%'
    let i = 0
    ;(function step() {
      if (i >= L.steps.length) {
        bar.style.width = '100%'
        what.textContent = L.ready
        Sound.confirm()
        Hooks.emit('start', { player, settings: Store.all() })
        return
      }
      what.textContent = L.steps[i]
      bar.style.width = Math.round((i / L.steps.length) * 100) + '%'
      i++
      later(step, 400 + Math.random() * 340)
    })()
  }
  UI.register('loading', { el: 'loading', key() {} })

  /* ---- 12. LANGUAGE — repaints every screen ------------------------------ */
  function applyLang() {
    const L = t()
    document.documentElement.lang = Store.get('lang').toLowerCase()
    root.querySelector('.tab[data-mode="login"]').textContent = L.tabLogin
    root.querySelector('.tab[data-mode="register"]').textContent = L.tabReg
    $('auth-title').textContent = L.authTitle
    $('lbl-user').textContent = L.fUser
    $('lbl-pass').textContent = L.fPass
    $('lbl-mail').textContent = L.fMail
    goBtn.textContent = authMode === 'login' ? L.btnLogin : L.btnReg
    outBtn.textContent = L.btnOut
    outBtn.hidden = !player
    $('hint-auth').textContent = L.hintBack
    $('hint-cred').textContent = L.hintBack
    $('cred-title').textContent = L.credTitle
    $('cred-body').innerText = L.credBody
    $('set-title').textContent = L.setTitle
    $('hint-set').textContent = L.hintSet
    $('bye-title').textContent = L.byeTitle
    $('bye-body').innerText = L.byeBody
    paintMenu()
    if (UI.now() === 'settings') paintOpts()
  }

  /* ---- 13. INPUT --------------------------------------------------------- */
  function onKey(e) {
    const s = Screens[UI.now()]
    if (e.key === 'Escape') {
      if (UI.now() !== 'title' && UI.now() !== 'loading') { Sound.back(); UI.go('title') }
      return
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      && document.activeElement.tagName !== 'INPUT') e.preventDefault()
    if (s && s.key) s.key(e)
  }
  addEventListener('keydown', onKey)

  /* ---- 14. HOOKS — where three.js takes over ----------------------------- */
  const Hooks = (() => {
    const map = {}
    return {
      on(ev, fn) { (map[ev] = map[ev] || []).push(fn) },
      emit(ev, d) { (map[ev] || []).forEach(fn => fn(d)) }
    }
  })()
  window.Game = {
    on: Hooks.on,
    show: () => { root.style.display = 'flex'; UI.go('title') },
    hide: () => { root.style.display = 'none' },
    settings: () => Store.all(),
    player: () => player
  }
  Hooks.on('start', d => console.log('[menu] start →', d))

  /* ---- 15. BOOT, including the glyph guard for Ž ------------------------- */
  function glyphGuard() {
    if (!alive) return
    const ok = document.fonts && document.fonts.check
      ? document.fonts.check('700 34px "Pixelify Sans"', '\u017D\u0117\u0173')
      : true
    root.classList.toggle('nopix', !ok)
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(glyphGuard)
  else addEventListener('load', glyphGuard)

  fit()
  applyLang()
  UI.go('title')

  /* ---- CLEANUP ----------------------------------------------------------- */
  return () => {
    alive = false
    cancelAnimationFrame(raf)
    timers.forEach(clearTimeout)
    timers.clear()
    removeEventListener('resize', fit)
    removeEventListener('keydown', onKey)
    removeEventListener('load', glyphGuard)
    Sound.close()
    if (window.Game) delete window.Game
  }
}

export default App