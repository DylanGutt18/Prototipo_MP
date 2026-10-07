/* profits.js
   =========================================================
   Página de Lucros — gráfico, tabela, contadores e relógio.
   Totalmente independente, sem integração com outros scripts.
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------------------------------------------------------
     MENU MOBILE (mesmo comportamento, código próprio)
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  /* ---------------------------------------------------------
     COUNT-UP
     --------------------------------------------------------- */
  function animateNumber(el, to, { duration = 1100, decimals = 0 } = {}) {
    const from = 0;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toLocaleString('pt-BR');
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = decimals
        ? to.toFixed(decimals).replace('.', ',')
        : to.toLocaleString('pt-BR');
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
     GRÁFICO — Receita / Custos / Lucro
     --------------------------------------------------------- */
  const Chart = (() => {
    const host = $('#chartProfits');
    if (!host) return { render() {} };

    const revenue = [3200, 4100, 3800, 4600, 5200, 4900, 5600, 6200, 5900, 6800, 7100, 7600];
    const costs   = [1800, 2100, 2000, 2400, 2600, 2500, 2800, 3100, 3000, 3400, 3500, 3700];
    const profit  = revenue.map((r, i) => r - costs[i]);
    const labels  = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];

    const ns = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs = {}) {
      const el = document.createElementNS(ns, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    }

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

      const max = Math.max(...revenue, ...costs, ...profit) * 1.12;
      const stepX = iw / (revenue.length - 1);
      const yFor = v => pad.t + ih - (v / max) * ih;

      const ptsRevenue = revenue.map((v, i) => [pad.l + i * stepX, yFor(v)]);
      const ptsCosts   = costs.map((v, i) => [pad.l + i * stepX, yFor(v)]);
      const ptsProfit  = profit.map((v, i) => [pad.l + i * stepX, yFor(v)]);

      const svg = svgEl('svg', {
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      // gradient para lucro
      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', {
        id: 'gProfit', x1: '0', y1: '0', x2: '0', y2: '1',
      });
      grad.appendChild(svgEl('stop', {
        offset: '0',
        'stop-color': 'var(--chart-3)',
        'stop-opacity': '.25',
      }));
      grad.appendChild(svgEl('stop', {
        offset: '1',
        'stop-color': 'var(--chart-3)',
        'stop-opacity': '0',
      }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      // grid
      const gridG = svgEl('g', {
        stroke: 'var(--chart-grid)',
        'stroke-width': '1',
      });
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ih / 4) * i;
        gridG.appendChild(svgEl('line', { x1: pad.l, y1: y, x2: W - pad.r, y2: y }));
      }
      svg.appendChild(gridG);

      // área sob lucro
      const areaD =
        smoothPath(ptsProfit) +
        ` L ${ptsProfit[ptsProfit.length - 1][0]} ${pad.t + ih}` +
        ` L ${ptsProfit[0][0]} ${pad.t + ih} Z`;
      const area = svgEl('path', { d: areaD, fill: 'url(#gProfit)', opacity: '0' });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .25s';
        area.setAttribute('opacity', '1');
      });

      // linhas
      const lineRevenue = svgEl('path', {
        d: smoothPath(ptsRevenue),
        fill: 'none',
        stroke: 'var(--chart-1)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      const lineCosts = svgEl('path', {
        d: smoothPath(ptsCosts),
        fill: 'none',
        stroke: 'var(--chart-2)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      const lineProfit = svgEl('path', {
        d: smoothPath(ptsProfit),
        fill: 'none',
        stroke: 'var(--chart-3)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });

      [lineRevenue, lineCosts, lineProfit].forEach((line, idx) => {
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

      // pontos na linha de lucro
      ptsProfit.forEach((p, i) => {
        const c = svgEl('circle', {
          cx: p[0], cy: p[1], r: '0',
          fill: 'var(--chart-3)',
          stroke: 'var(--bg-1)',
          'stroke-width': '2',
        });
        svg.appendChild(c);
        c.style.transition = `r .35s cubic-bezier(.16,1,.3,1) ${0.5 + i * 0.04}s`;
        requestAnimationFrame(() => c.setAttribute('r', '2.8'));
      });

      // labels
      const labelG = svgEl('g', {
        fill: 'var(--chart-label)',
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

    let rafId = null;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    });
    ro.observe(host);

    return { render };
  })();

  /* ---------------------------------------------------------
     TABELA DE LUCRO POR PRODUTO
     --------------------------------------------------------- */
  const products = [
    { name: 'Plano Pro',       revenue: 18400, cost: 6200,  margin: 66.3 },
    { name: 'Plano Starter',   revenue: 12800, cost: 5800,  margin: 54.7 },
    { name: 'Add-on Analytics',revenue: 7900,  cost: 2100,  margin: 73.4 },
    { name: 'Consultoria',     revenue: 5600,  cost: 3200,  margin: 42.9 },
    { name: 'Treinamento',     revenue: 3530,  cost: 1440,  margin: 59.2 },
  ];

  function renderProfitTable() {
    const host = $('#profitTable');
    if (!host) return;

    const maxProfit = Math.max(...products.map(p => p.revenue - p.cost));
    const fmtBRL = v => 'R$ ' + v.toLocaleString('pt-BR');

    const head = `
      <div class="profit-row profit-head">
        <span>Produto</span>
        <span class="num">Receita</span>
        <span class="num">Lucro</span>
        <span class="num">Margem</span>
      </div>
    `;

    const rows = products.map(p => {
      const profit = p.revenue - p.cost;
      const pct = Math.round((profit / maxProfit) * 100);
      return `
        <div class="profit-row">
          <span class="profit-name">${p.name}</span>
          <span class="num">${fmtBRL(p.revenue)}</span>
          <span class="num positive" style="--bar:${pct}%">
            ${fmtBRL(profit)}
          </span>
          <span class="num">${p.margin.toFixed(1).replace('.', ',')}%</span>
        </div>
      `;
    }).join('');

    host.innerHTML = head + rows;
  }

  /* ---------------------------------------------------------
     RELÓGIO
     --------------------------------------------------------- */
  function startClock() {
    const el = $('#clock');
    if (!el) return;
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30_000);
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */
  function boot() {
    runCounters();
    startClock();
    renderProfitTable();
    requestAnimationFrame(() => Chart.render());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ---------------------------------------------------------
     API PÚBLICA
     --------------------------------------------------------- */
  window.Profits = {
    animateNumber,
    runCounters,
    chart: Chart,
    table: { render: renderProfitTable },
    menu: { set: setMenu, close: () => setMenu(false) },
  };
})();