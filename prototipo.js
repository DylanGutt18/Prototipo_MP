/* ==========================================================================
   prototipo.js — menu · count-up · gráficos · relógio
   Gráficos usam viewBox fixo; CSS escala. Sem ResizeObserver.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ===== MENU MOBILE ===== */
  const body = document.body;

  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    const btn = $('#menuBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
  };

  $('#menuBtn')?.addEventListener('click', () =>
    setMenu(!body.classList.contains('menu-open'))
  );
  $('#overlay')?.addEventListener('click', () => setMenu(false));
  $('#menu')?.addEventListener('click', e => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    $$('.menu-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  /* ===== COUNT-UP ===== */
  const animateNumber = (el, to, { duration = 1100, decimals = 0 } = {}) => {
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = to * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toString();
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const runCounters = (root = document) => {
    $$('[data-count]', root).forEach(el => {
      const to = parseFloat(el.dataset.count);
      if (Number.isNaN(to)) return;
      animateNumber(el, to, {
        duration: 1000 + Math.random() * 250,
        decimals: el.dataset.decimals ? +el.dataset.decimals : 0,
      });
    });
  };

  /* ===== CURVA SUAVE ===== */
  const smoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6},` +
           ` ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6},` +
           ` ${p2[0]} ${p2[1]}`;
    }
    return d;
  };

  /* ===== LINHA — RECEITA × DESPESA ===== */
  const Chart = (() => {
    const host = $('#chart');
    if (!host) return { render() {} };

    const VW = 720, VH = 280;
    const receita = [18, 22, 20, 28, 32, 30, 36, 42, 40, 48, 45, 52];
    const despesa = [14, 16, 15, 20, 22, 24, 26, 28, 30, 32, 34, 36];
    const labels  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const build = () => {
      const pad = { t: 16, r: 8, b: 28, l: 8 };
      const iw = VW - pad.l - pad.r;
      const ih = VH - pad.t - pad.b;
      const max = Math.max(...receita, ...despesa) * 1.12;
      const stepX = iw / (receita.length - 1);
      const yFor = v => pad.t + ih - (v / max) * ih;

      const ptsR = receita.map((v, i) => [pad.l + i * stepX, yFor(v)]);
      const ptsD = despesa.map((v, i) => [pad.l + i * stepX, yFor(v)]);

      const svg = svgEl('svg', {
        viewBox: `0 0 ${VW} ${VH}`,
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-2)', 'stop-opacity': '.30' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-2)', 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const grid = svgEl('g', { stroke: 'var(--chart-grid)', 'stroke-width': '1' });
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ih / 4) * i;
        grid.appendChild(svgEl('line', { x1: pad.l, y1: y, x2: VW - pad.r, y2: y }));
      }
      svg.appendChild(grid);

      const areaD = smoothPath(ptsR) +
        ` L ${ptsR[ptsR.length - 1][0]} ${pad.t + ih}` +
        ` L ${ptsR[0][0]} ${pad.t + ih} Z`;
      const area = svgEl('path', { d: areaD, fill: 'url(#gArea)', opacity: '0' });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .25s';
        area.style.opacity = '1';
      });

      [['var(--chart-1)', ptsD], ['var(--chart-2)', ptsR]].forEach(([color, pts], idx) => {
        const line = svgEl('path', {
          d: smoothPath(pts),
          fill: 'none',
          stroke: color,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
        });
        svg.appendChild(line);
        requestAnimationFrame(() => {
          const len = line.getTotalLength();
          line.style.strokeDasharray = `${len}`;
          line.style.strokeDashoffset = `${len}`;
          line.style.transition = `stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1) ${idx * 0.15}s`;
          requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
        });
      });

      ptsR.forEach((p, i) => {
        const c = svgEl('circle', {
          cx: p[0], cy: p[1], r: '0',
          fill: 'var(--chart-2)',
          stroke: 'var(--bg-1)',
          'stroke-width': '2',
        });
        svg.appendChild(c);
        c.style.transition = `r .35s cubic-bezier(.16,1,.3,1) ${0.5 + i * 0.04}s`;
        requestAnimationFrame(() => c.setAttribute('r', '2.8'));
      });

      const labelG = svgEl('g', {
        fill: 'var(--chart-label)',
        'font-size': '10',
        'font-family': 'JetBrains Mono, monospace',
        'text-anchor': 'middle',
      });
      labels.forEach((lb, i) => {
        if (i % 2 !== 0) return;
        const t = svgEl('text', { x: pad.l + i * stepX, y: VH - 8 });
        t.textContent = lb;
        labelG.appendChild(t);
      });
      svg.appendChild(labelG);
      return svg;
    };

    const render = () => {
      host.innerHTML = '';
      host.appendChild(build());
    };

    return { render };
  })();

  /* ===== DONUT ===== */
  const Donut = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    const size = 140, stroke = 18;
    const r = (size - stroke) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}` });
    svg.style.opacity = '0';
    svg.style.transform = 'scale(.85)';
    svg.style.transformOrigin = 'center';

    svg.appendChild(svgEl('circle', {
      cx, cy, r, fill: 'none',
      stroke: 'var(--bg-3)', 'stroke-width': stroke,
    }));

    let acc = 0;
    data.forEach(d => {
      const len = (d.value / total) * circ;
      svg.appendChild(svgEl('circle', {
        cx, cy, r, fill: 'none',
        stroke: `var(${d.color})`,
        'stroke-width': stroke,
        'stroke-dasharray': `${len} ${circ - len}`,
        'stroke-dashoffset': -acc,
        transform: `rotate(-90 ${cx} ${cy})`,
      }));
      acc += len;
    });

    const center = svgEl('text', {
      x: cx, y: cy + 5,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '14',
      'font-weight': '600',
      fill: 'var(--fg)',
    });
    center.textContent = data[0]?.center || '';
    svg.appendChild(center);

    host.innerHTML = '';
    host.appendChild(svg);

    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    data.forEach(d => {
      const pct = Math.round((d.value / total) * 100);
      const item = document.createElement('span');
      item.innerHTML = `<i style="background:var(${d.color})"></i>${d.label}<b>${pct}%</b>`;
      legend.appendChild(item);
    });
    host.appendChild(legend);

    requestAnimationFrame(() => {
      svg.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), opacity .5s ease';
      svg.style.transform = 'scale(1)';
      svg.style.opacity = '1';
    });
  };

  /* ===== BARRAS ===== */
  const Bars = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    const VW = 360, VH = 170;
    const pad = { t: 12, r: 4, b: 24, l: 4 };
    const iw = VW - pad.l - pad.r;
    const ih = VH - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const step = iw / data.length;
    const bw = step * 0.5;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${VW} ${VH}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    });

    const grid = svgEl('g', { stroke: 'var(--chart-grid)', 'stroke-width': '1' });
    for (let i = 0; i <= 3; i++) {
      const y = pad.t + (ih / 3) * i;
      grid.appendChild(svgEl('line', { x1: pad.l, y1: y, x2: VW - pad.r, y2: y }));
    }
    svg.appendChild(grid);

    const defs = svgEl('defs');
    const gid = `barG-${id}`;
    const grad = svgEl('linearGradient', { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-1)', 'stop-opacity': '1' }));
    grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-1)', 'stop-opacity': '.35' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    data.forEach((d, i) => {
      const x = pad.l + i * step + (step - bw) / 2;
      const h = (d.value / max) * ih;
      const y = pad.t + ih - h;
      const bar = svgEl('rect', {
        x, y: pad.t + ih, width: bw, height: 0, rx: 3,
        fill: `url(#${gid})`,
      });
      svg.appendChild(bar);
      bar.style.transition = `y .8s cubic-bezier(.16,1,.3,1) ${i * 0.05}s,` +
                             ` height .8s cubic-bezier(.16,1,.3,1) ${i * 0.05}s`;
      requestAnimationFrame(() => {
        bar.setAttribute('y', y);
        bar.setAttribute('height', h);
      });
    });

    const labelG = svgEl('g', {
      fill: 'var(--chart-label)',
      'font-size': '10',
      'font-family': 'JetBrains Mono, monospace',
      'text-anchor': 'middle',
    });
    data.forEach((d, i) => {
      const t = svgEl('text', { x: pad.l + i * step + step / 2, y: VH - 8 });
      t.textContent = d.label;
      labelG.appendChild(t);
    });
    svg.appendChild(labelG);

    host.innerHTML = '';
    host.appendChild(svg);
  };

  /* ===== RELÓGIO ===== */
  const startClock = () => {
    const el = $('#clock');
    if (!el) return;
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30_000);
  };

  /* ===== RENDER GERAL ===== */
  const renderAll = () => {
    Chart.render();
    Donut('donutCategorias', [
      { label: 'Marketing',      value: 35, color: '--chart-1' },
      { label: 'Operacional',    value: 30, color: '--chart-2' },
      { label: 'Salários',       value: 20, color: '--chart-3' },
      { label: 'Infraestrutura', value: 15, color: '--chart-4' },
    ]);
    Donut('donutOrigem', [
      { label: 'Recorrente', value: 58, color: '--chart-2' },
      { label: 'Novos',      value: 42, color: '--chart-1' },
    ]);
    Bars('barSemana', [
      { label: 'Seg', value: 4.5 },
      { label: 'Ter', value: 5.2 },
      { label: 'Qua', value: 4.8 },
      { label: 'Qui', value: 5.5 },
      { label: 'Sex', value: 6.2 },
      { label: 'Sáb', value: 3.8 },
    ]);
  };

  /* ===== BOOT ===== */
  const boot = () => {
    runCounters();
    startClock();
    renderAll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Dash = { animateNumber, runCounters, chart: Chart, renderAll };
})();