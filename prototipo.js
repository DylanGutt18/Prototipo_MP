(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------------------------------------------------------
     TEMA
     --------------------------------------------------------- */
  const THEMES = ['violet', 'ocean', 'emerald', 'amber', 'rose'];
  const THEME_KEY = 'dash:theme';

  function applyTheme(name) {
    if (!THEMES.includes(name)) name = 'violet';
    document.documentElement.dataset.theme = name;
    try { localStorage.setItem(THEME_KEY, name); } catch (_) {}

    $$('.swatch').forEach(sw => {
      sw.classList.toggle('is-active', sw.dataset.theme === name);
    });

    const active = $(`.swatch[data-theme="${name}"]`);
    const label  = $('#themeName');
    if (active && label) label.textContent = active.dataset.name || name;

    // redesenha o gráfico para atualizar as cores do acento
    requestAnimationFrame(() => Chart.render());
  }

  // aplica tema salvo antes do primeiro paint (evita flash)
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (_) {}

  /* ---------------------------------------------------------
     MENU LATERAL (mobile)
     --------------------------------------------------------- */
  const body = document.body;

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    const btn = $('#menuBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
  }

  const menuBtn = $('#menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () =>
      setMenu(!body.classList.contains('menu-open'))
    );
  }

  const overlay = $('#overlay');
  if (overlay) overlay.addEventListener('click', () => setMenu(false));

  const menu = $('#menu');
  if (menu) {
    menu.addEventListener('click', e => {
      const item = e.target.closest('.menu-item');
      if (item) {
        $$('.menu-item', menu).forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        setMenu(false);
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      setMenu(false);
      Popover.close();
    }
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  /* ---------------------------------------------------------
     POPOVER DE APARÊNCIA
     --------------------------------------------------------- */
  const Popover = (() => {
    const btn  = $('#settingsBtn');
    const pop  = $('#themePop');
    if (!btn || !pop) return { close() {}, toggle() {} };

    let open = false;

    function set(state) {
      open = state;
      pop.hidden = !open;
      pop.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      set(!open);
    });

    pop.addEventListener('click', e => {
      const sw = e.target.closest('.swatch');
      if (sw) applyTheme(sw.dataset.theme);
      e.stopPropagation();
    });

    document.addEventListener('click', e => {
      if (!open) return;
      if (!pop.contains(e.target) && e.target !== btn) set(false);
    });

    return {
      close: () => set(false),
      toggle: () => set(!open),
    };
  })();

  // wiring dos swatches antes do primeiro render
  $$('.swatch').forEach(sw => {
    sw.addEventListener('click', () => applyTheme(sw.dataset.theme));
  });

  /* ---------------------------------------------------------
     COUNT-UP (números)
     --------------------------------------------------------- */
  function animateNumber(el, to, { duration = 1100, decimals = 0 } = {}) {
    const from = 0;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toString();
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = decimals
        ? to.toFixed(decimals).replace('.', ',')
        : String(to);
    }
    requestAnimationFrame(frame);
  }

  function runCounters(root = document) {
    $$('[data-count]', root).forEach(el => {
      const target = parseFloat(el.dataset.count);
      if (Number.isNaN(target)) return;
      animateNumber(el, target, {
        duration: 1000 + Math.random() * 250,
        decimals: el.dataset.decimals ? +el.dataset.decimals : 0,
      });
    });
  }

  /* ---------------------------------------------------------
     GRÁFICO (SVG com curvas suaves + animação de traço)
     --------------------------------------------------------- */
  const Chart = (() => {
    const host = $('#chart');
    if (!host) return { render() {} };

    const created = [12, 19, 14, 24, 21, 29, 27, 34, 31, 39, 37, 44];
    const solved  = [10, 16, 15, 21, 24, 26, 30, 32, 34, 36, 39, 42];
    const labels  = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];

    const ns = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs = {}) {
      const el = document.createElementNS(ns, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    }

    // Catmull-Rom → Bézier cúbica (curva suave passando pelos pontos)
    function smoothPath(pts) {
      if (pts.length < 2) return '';
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
      }
      return d;
    }

    function build() {
      const rect = host.getBoundingClientRect();
      const W = Math.max(320, rect.width);
      const H = Math.max(180, rect.height);
      const pad = { t: 16, r: 8, b: 28, l: 8 };
      const iw = W - pad.l - pad.r;
      const ih = H - pad.t - pad.b;

      const max = Math.max(...created, ...solved) * 1.12;
      const stepX = iw / (created.length - 1);
      const yFor = v => pad.t + ih - (v / max) * ih;

      const ptsCreated = created.map((v, i) => [pad.l + i * stepX, yFor(v)]);
      const ptsSolved  = solved.map((v, i) => [pad.l + i * stepX, yFor(v)]);

      const svg = svgEl('svg', {
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      // -------- gradiente do acento (para o "resolvidos")
      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', {
        id: 'gAccent', x1: '0', y1: '0', x2: '0', y2: '1',
      });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#4dd4e8', 'stop-opacity': '.28' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#4dd4e8', 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      // -------- grid horizontal
      const gridG = svgEl('g', { stroke: 'rgba(255,255,255,.06)', 'stroke-width': '1' });
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ih / 4) * i;
        gridG.appendChild(svgEl('line', { x1: pad.l, y1: y, x2: W - pad.r, y2: y }));
      }
      svg.appendChild(gridG);

      // -------- área sob "resolvidos"
      const areaD =
        smoothPath(ptsSolved) +
        ` L ${ptsSolved[ptsSolved.length - 1][0]} ${pad.t + ih}` +
        ` L ${ptsSolved[0][0]} ${pad.t + ih} Z`;
      const area = svgEl('path', {
        d: areaD,
        fill: 'url(#gAccent)',
        opacity: '0',
      });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .25s';
        area.setAttribute('opacity', '1');
      });

      // -------- linha "criados"
      const dCreated = smoothPath(ptsCreated);
      const lineCreated = svgEl('path', {
        d: dCreated,
        fill: 'none',
        stroke: '#a78bfa',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });

      // -------- linha "resolvidos"
      const dSolved = smoothPath(ptsSolved);
      const lineSolved = svgEl('path', {
        d: dSolved,
        fill: 'none',
        stroke: '#4dd4e8',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });

      // animação de traço (mede o comprimento e "desenha")
      [lineCreated, lineSolved].forEach((line, idx) => {
        svg.appendChild(line);
        requestAnimationFrame(() => {
          const len = line.getTotalLength();
          line.style.strokeDasharray = `${len}`;
          line.style.strokeDashoffset = `${len}`;
          line.style.transition =
            `stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1) ${idx * 0.15}s`;
          requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
        });
      });

      // -------- pontos destacados na linha "resolvidos"
      ptsSolved.forEach((p, i) => {
        const c = svgEl('circle', {
          cx: p[0], cy: p[1], r: '0',
          fill: '#4dd4e8',
          stroke: 'var(--bg-1)',
          'stroke-width': '2',
        });
        svg.appendChild(c);
        c.style.transition =
          `r .35s cubic-bezier(.16,1,.3,1) ${0.5 + i * 0.04}s`;
        requestAnimationFrame(() => c.setAttribute('r', '2.8'));
      });

      // -------- labels eixo X
      const labelG = svgEl('g', {
        fill: 'rgba(255,255,255,.35)',
        'font-size': '10',
        'font-family': 'JetBrains Mono, monospace',
        'text-anchor': 'middle',
      });
      labels.forEach((lb, i) => {
        if (i % 2 !== 0 && labels.length > 8) return;
        const t = svgEl('text', { x: pad.l + i * stepX, y: H - 8 });
        t.textContent = lb;
        labelG.appendChild(t);
      });
      svg.appendChild(labelG);

      return svg;
    }

    function render() {
      host.innerHTML = '';
      host.appendChild(build());
    }

    // redesenha em resize (debounce via rAF)
    let rafId = null;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    });
    ro.observe(host);

    return { render };
  })();

})();