/**
 * Camada de movimento.
 * Um único loop de rAF cuida de tudo que depende do scroll — nada de vários
 * listeners concorrendo. Todo efeito usa apenas `transform` e `opacity`,
 * então não há reflow nem deslocamento de layout.
 *
 * `prefers-reduced-motion` desliga o movimento de verdade: os elementos
 * nascem no estado final, o bloco fixo vira empilhado e o cursor some.
 */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

/* --- 1. REVELAÇÃO AO ENTRAR NA TELA ------------------------------------- */
function initReveal() {
  if (reduced.matches) {
    $$('[data-reveal], .split').forEach(n => n.classList.add('is-in'));
    window.__revealScan = root => $$('[data-reveal], .split', root).forEach(n => n.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target); // revela uma vez só: nada de piscar ao subir
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  const scan = (root = document) => $$('[data-reveal], .split', root).forEach(n => {
    if (!n.classList.contains('is-in')) io.observe(n);
  });
  window.__revealScan = scan;
  scan();
}

/* --- 2. SPLIT POR PALAVRA ----------------------------------------------- */
/* Quebra o texto em palavras envolvidas por máscara, preservando espaços e
   mantendo o texto original acessível a leitores de tela. */
function initSplit() {
  $$('[data-split]').forEach(node => {
    const text = node.textContent.trim();
    node.setAttribute('aria-label', text);
    const words = text.split(/\s+/);
    node.replaceChildren(...words.flatMap((w, i) => {
      const span = document.createElement('span');
      span.className = 'split';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--d', String(i));
      const inner = document.createElement('i');
      inner.textContent = w;
      span.append(inner);
      return i < words.length - 1 ? [span, document.createTextNode(' ')] : [span];
    }));
  });
}

/* --- 3. NAVEGAÇÃO: encolher, menu fullscreen, seção ativa --------------- */
function initNav() {
  const nav = $('#nav');
  const burger = $('#navBurger');
  const menu = $('#navMenu');
  const links = () => $$('.nav__link');

  /* Menu fullscreen com trava de scroll, Esc e foco preso dentro do painel. */
  let lastFocus = null;
  const setOpen = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { lastFocus = document.activeElement; $('.navmenu__link', menu)?.focus(); }
    else lastFocus?.focus?.();
  };
  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
    if (e.key !== 'Tab' || !menu.classList.contains('is-open')) return;
    const f = [burger, ...$$('a', menu)];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  /* Voltar ao desktop com o menu aberto não pode deixar o scroll travado. */
  const mq = window.matchMedia('(min-width: 64rem)');
  mq.addEventListener('change', e => { if (e.matches) setOpen(false); });

  /* Seção ativa na navegação. */
  const sections = $$('main section[id]');
  if (sections.length) {
    const spy = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = `#${e.target.id}`;
        links().forEach(l => l.setAttribute('aria-current', String(l.getAttribute('href') === id)));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  return { nav };
}

/* --- 4. CONTADOR (4,7) --------------------------------------------------- */
function initCounter() {
  const node = $('#proofValue');
  if (!node) return;
  const to = parseFloat(node.dataset.countTo || '0');
  const fmt = n => n.toFixed(1).replace('.', ',');
  if (reduced.matches) { node.textContent = fmt(to); return; }

  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    const dur = 1500, t0 = performance.now();
    const tick = now => {
      const p = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4); // ease-out quart
      node.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  io.observe(node);
}

/* --- 5. CURSOR PERSONALIZADO (desktop, ponteiro fino) ------------------- */
function initCursor() {
  if (!fine.matches || reduced.matches) return;
  const cur = $('#cursor');
  const ring = $('.cursor__ring', cur);
  if (!cur) return;
  document.body.classList.add('has-cursor');

  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
  const loop = () => {
    x = lerp(x, tx, 0.18); y = lerp(y, ty, 0.18);
    ring.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
    const hot = e.target.closest?.('a, button, [data-cursor="hot"]');
    cur.classList.toggle('is-hot', Boolean(hot));
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('is-hot'), { passive: true });
  document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cur.style.opacity = ''; });
}

/* --- 6. BOTÃO MAGNÉTICO -------------------------------------------------- */
function initMagnetic() {
  if (!fine.matches || reduced.matches) return;
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
      b.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    }, { passive: true });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* --- 7. LOOP DE SCROLL: navbar, parallax e a sequência "1 metro" -------- */
function initScroll(nav) {
  const track = $('#metroTrack');
  const num = $('#metroNum');
  const fill = $('#metroFill');
  const media = $('#metroMedia');
  const steps = $$('.metro__step');
  const parallax = $$('[data-parallax]');

  let ticking = false;
  const read = () => {
    ticking = false;
    const vh = innerHeight;

    nav?.classList.toggle('is-stuck', scrollY > 24);

    /* Sequência fixa: a régua enche, o número sobe até 100 e a pizza desliza. */
    if (track && !reduced.matches) {
      const r = track.getBoundingClientRect();
      const total = r.height - vh;
      const p = total > 0 ? clamp(-r.top / total) : 0;

      fill?.style.setProperty('--p', p.toFixed(4));
      if (num) num.textContent = String(Math.round(p * 100));

      const img = media?.firstElementChild;
      if (img) img.style.setProperty('--pxx', `${((0.5 - p) * 7).toFixed(2)}%`);

      // Exatamente uma etapa visível por vez: a narração troca, não acumula.
      const at = Math.min(steps.length - 1, Math.floor(p * steps.length));
      steps.forEach((s, i) => s.classList.toggle('is-on', i === at));
    }

    /* Parallax das fotos: deslocamento pequeno, dentro da folga do scale. */
    if (!reduced.matches) {
      for (const node of parallax) {
        const r = node.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const center = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
        const amt = clamp(center, -1, 1) * (parseFloat(node.dataset.parallax) || 0.06) * 100;
        node.firstElementChild?.style.setProperty('--pxy', `${amt.toFixed(2)}px`);
      }
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(read); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  read();
}

/* --- boot ---------------------------------------------------------------- */
export function initMotion() {
  initSplit();
  initReveal();
  const { nav } = initNav();
  initCounter();
  initCursor();
  initMagnetic();
  initScroll(nav);
  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
}
