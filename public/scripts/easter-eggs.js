/* =====================================================================
   Pappol easter eggs (client-side)
   - Console greeting
   - Type "pappol" anywhere -> "Pappol mode" (hue spin + confetti + toast)
   These run on every page. See /easter-eggs for the full list.
   ===================================================================== */
(() => {
  'use strict';

  /* ---- Egg: console greeting ---- */
  const c = 'color:#fff;background:hsl(260 72% 55%);padding:3px 8px;border-radius:6px;font-weight:700';
  console.log('%cPappol', c, 'you found the console. There are more eggs at /easter-eggs 👀');
  console.log('Tip: type "pappol" anywhere on the page.');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Egg: type "pappol" to trigger Pappol mode ---- */
  const SECRET = 'pappol';
  let buffer = '';
  let active = false;

  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.setAttribute('role', 'status');
    Object.assign(t.style, {
      position: 'fixed',
      left: '50%',
      bottom: '2rem',
      transform: 'translateX(-50%) translateY(20px)',
      background: 'var(--accent, hsl(260 72% 55%))',
      color: 'var(--accent-contrast, #fff)',
      padding: '0.7rem 1.1rem',
      borderRadius: '12px',
      fontWeight: '600',
      fontFamily: 'inherit',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity .26s, transform .26s',
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => t.remove(), 400);
    }, 3200);
  }

  function confetti() {
    if (reduceMotion) return;
    const n = 36;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      const size = 6 + Math.random() * 8;
      // confetti hues centred on the Pappol hue (260)
      const hue = 230 + Math.random() * 80;
      Object.assign(d.style, {
        position: 'fixed',
        left: 50 + (Math.random() * 40 - 20) + 'vw',
        top: '-5vh',
        width: size + 'px',
        height: size + 'px',
        background: `hsl(${hue} 75% 62%)`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        zIndex: '9998',
        pointerEvents: 'none',
        opacity: '0.95',
      });
      document.body.appendChild(d);
      const fall = 80 + Math.random() * 30;
      const drift = Math.random() * 30 - 15;
      const rot = Math.random() * 720 - 360;
      d.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${drift}vw, ${fall}vh) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(0.62,0,0.38,1)' }
      ).onfinish = () => d.remove();
    }
  }

  function pappolMode() {
    if (active) return;
    active = true;
    const root = document.documentElement;
    confetti();
    toast('🎉 Pappol mode! (see /easter-eggs)');
    if (!reduceMotion) {
      // Spin the signature hue through a full rotation, then settle back.
      let start;
      const base = 260;
      const dur = 2600;
      function frame(ts) {
        if (start === undefined) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        root.style.setProperty('--pappol-hue', String(Math.round(base + p * 360)));
        if (p < 1) requestAnimationFrame(frame);
        else {
          root.style.setProperty('--pappol-hue', String(base));
          active = false;
        }
      }
      requestAnimationFrame(frame);
    } else {
      active = false;
    }
  }

  window.addEventListener('keydown', (e) => {
    // ignore when typing in form fields
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key && e.key.length === 1) {
      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer === SECRET) {
        buffer = '';
        pappolMode();
      }
    }
  });

  // Expose for the easter-eggs page "try it" button
  window.__pappolMode = pappolMode;
})();
