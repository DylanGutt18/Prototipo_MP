/* ==========================================================================
   prototipo.js — menu · gráficos · período · popovers · toast
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

  /* ===== DATASETS POR PERÍODO ===== */
  const DATASETS = {
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      receita: [0.9,1.1,0.8,1.3,1.2,1.5,1.4,1.6,1.8,1.5,1.9,1.7,2.0,1.8,1.6,2.1,1.9,2.2,2.0,1.8,2.3,2.1,2.2,2.0,2.4,2.3,2.1,2.5,2.4,2.6],
      despesa: [0.7,0.8,0.6,0.9,0.8,1.0,0.9,1.1,1.2,1.0,1.3,1.1,1.4,1.2,1.1,1.4,1.3,1.5,1.4,1.2,1.5,1.4,1.5,1.3,1.6,1.5,1.4,1.6,1.5,1.7],
      variacaoReceita: 6.2,
      variacaoDespesa: 2.1,
      categorias: [
        { label: 'Marketing',      value: 32, color: '--chart-1' },
        { label: 'Operacional',    value: 28, color: '--chart-2' },
        { label: 'Salários',       value: 26, color: '--chart-3' },
        { label: 'Infraestrutura', value: 14, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 58, color: '--chart-2' },
        { label: 'Novos',      value: 42, color: '--chart-1' },
      ],
      barras: [
        { label: 'Seg', value: 4.5 },
        { label: 'Ter', value: 5.2 },
        { label: 'Qua', value: 4.8 },
        { label: 'Qui', value: 5.5 },
        { label: 'Sex', value: 6.2 },
        { label: 'Sáb', value: 3.8 },
        { label: 'Dom', value: 2.1 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 12, display: 'R$ 12k' },
        { label: 'Monitor 27"',     value: 9,  display: 'R$ 9k'  },
        { label: 'Teclado Mec.',    value: 7,  display: 'R$ 7k'  },
        { label: 'Headset BT',      value: 5,  display: 'R$ 5k'  },
        { label: 'Mouse Ergo',      value: 3,  display: 'R$ 3k'  },
      ],
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      receita: [8, 9, 11, 10, 12, 14, 13, 15, 16, 14, 17, 18],
      despesa: [6, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 14],
      variacaoReceita: 14.8,
      variacaoDespesa: -1.5,
      categorias: [
        { label: 'Marketing',      value: 28, color: '--chart-1' },
        { label: 'Operacional',    value: 30, color: '--chart-2' },
        { label: 'Salários',       value: 27, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 61, color: '--chart-2' },
        { label: 'Novos',      value: 39, color: '--chart-1' },
      ],
      barras: [
        { label: 'Out', value: 24 },
        { label: 'Nov', value: 28 },
        { label: 'Dez', value: 31 },
        { label: 'Jan', value: 26 },
        { label: 'Fev', value: 30 },
        { label: 'Mar', value: 34 },
        { label: 'Abr', value: 29 },
        { label: 'Mai', value: 33 },
        { label: 'Jun', value: 36 },
        { label: 'Jul', value: 31 },
        { label: 'Ago', value: 38 },
        { label: 'Set', value: 41 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 34, display: 'R$ 34k' },
        { label: 'Monitor 27"',     value: 27, display: 'R$ 27k' },
        { label: 'Teclado Mec.',    value: 21, display: 'R$ 21k' },
        { label: 'Headset BT',      value: 15, display: 'R$ 15k' },
        { label: 'Mouse Ergo',      value: 10, display: 'R$ 10k' },
      ],
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      receita: [18, 22, 20, 28, 32, 30, 36, 42, 40, 48, 45, 52],
      despesa: [14, 16, 15, 20, 22, 24, 26, 28, 30, 32, 34, 36],
      variacaoReceita: 12.4,
      variacaoDespesa: 3.8,
      categorias: [
        { label: 'Marketing',      value: 35, color: '--chart-1' },
        { label: 'Operacional',    value: 30, color: '--chart-2' },
        { label: 'Salários',       value: 20, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 64, color: '--chart-2' },
        { label: 'Novos',      value: 36, color: '--chart-1' },
      ],
      barras: [
        { label: 'Q1', value: 68 },
        { label: 'Q2', value: 90 },
        { label: 'Q3', value: 118 },
        { label: 'Q4', value: 137 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 128, display: 'R$ 128k' },
        { label: 'Monitor 27"',     value: 96,  display: 'R$ 96k'  },
        { label: 'Teclado Mec.',    value: 78,  display: 'R$ 78k'  },
        { label: 'Headset BT',      value: 54,  display: 'R$ 54k'  },
        { label: 'Mouse Ergo',      value: 34,  display: 'R$ 34k'  },
      ],
    },
  };

  /* Estoque é um snapshot — não muda com o período */
  const ESTOQUE = [
    { label: 'Notebook Pro 15', value: 3,  max: 40 },
    { label: 'Headset BT',      value: 5,  max: 35 },
    { label: 'Monitor 27"',     value: 8,  max: 50 },
    { label: 'Teclado Mec.',    value: 12, max: 60 },
    { label: 'Mouse Ergo',      value: 22, max: 80 },
  ];

  let periodoAtual = '1a';
  const visivel = { receita: true, despesa: true };

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

  /* ===== POPOVERS ===== */
  const perfilBtn = $('#perfilBtn');
  const perfilPop = $('#popPerfil');
  const ajudaBtn  = $('#ajudaBtn');
  const ajudaPop  = $('#popAjuda');

  function fecharPops() {
    [perfilPop, ajudaPop].forEach(p => {
      if (!p) return;
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });
    [perfilBtn, ajudaBtn].forEach(b => {
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  function abrirPop(pop, btn) {
    fecharPops();
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }

  perfilBtn?.addEventListener('click', e => {
    e.stopPropagation();
    perfilPop.classList.contains('is-open') ? fecharPops() : abrirPop(perfilPop, perfilBtn);
  });
  ajudaBtn?.addEventListener('click', e => {
    e.stopPropagation();
    ajudaPop.classList.contains('is-open') ? fecharPops() : abrirPop(ajudaPop, ajudaBtn);
  });
  perfilPop?.addEventListener('click', e => e.stopPropagation());
  ajudaPop?.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', fecharPops);

  /* ===== TOAST ===== */
  const toastHost = document.createElement('div');
  toastHost.className = 'toast-host';
  document.body.appendChild(toastHost);

  function mostrarToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `
      <span class="toast-icon">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
             stroke="currentColor" stroke-width="2.4"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="5 12 10 17 19 7"/>
        </svg>
      </span>
      <span>${msg}</span>
    `;
    toastHost.appendChild(t);
    setTimeout(() => {
      t.classList.add('is-leaving');
      t.addEventListener('animationend', () => t.remove());
    }, 2400);
  }

  const ACOES_AJUDA = {
    docs:    'Abrindo documentação…',
    suporte: 'Conectando com o suporte…',
    atalhos: 'Atalhos: Ctrl+K, Ctrl+/, Shift+?',
    sobre:   'Painel v1.0 · build 2026.10',
  };

  document.querySelectorAll('.pop-item[data-action]').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      mostrarToast(ACOES_AJUDA[item.dataset.action] || `Ação: ${item.dataset.action}`);
      fecharPops();
    });
  });

  /* ===== COUNT-UP ===== */
  function animateNumber(el, to, { duration = 700, decimals = 0 } = {}) {
    const from = parseFloat(
      String(el.textContent).replace(/\./g, '').replace(',', '.')
    ) || 0;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toString();
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function runCounters(root = document) {
    $$('[data-count]', root).forEach(el => {
      const to = parseFloat(el.dataset.count);
      if (Number.isNaN(to)) return;
      el.textContent = '0';
      animateNumber(el, to, {
        duration: 1000 + Math.random() * 250,
        decimals: el.dataset.decimals ? +el.dataset.decimals : 0,
      });
    });
  }

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

  /* ===== GRÁFICO PRINCIPAL ===== */
  const Chart = (() => {
    const host = $('#chart');
    if (!host) return { render() {} };

    const build = (data) => {
      const { receita, despesa, labels } = data;
      const max = Math.max(...receita, ...despesa) * 1.12;
      const n = receita.length;

      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => (1 - v / max) * 100;

      const ptsR = receita.map((v, i) => [xAt(i), yAt(v)]);
      const ptsD = despesa.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-2)', 'stop-opacity': '.30' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-2)', 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const grid = svgEl('g', {
        stroke: 'var(--chart-grid)',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      });
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * 100;
        grid.appendChild(svgEl('line', { x1: '0', y1: y, x2: '100', y2: y }));
      }
      svg.appendChild(grid);

      const areaD = smoothPath(ptsR) + ` L 100 100 L 0 100 Z`;
      const area = svgEl('path', {
        d: areaD,
        fill: 'url(#gArea)',
        opacity: '0',
        class: 'serie serie--receita' + (visivel.receita ? '' : ' is-hidden'),
      });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      const series = [
        { key: 'despesa', color: 'var(--chart-1)', pts: ptsD },
        { key: 'receita', color: 'var(--chart-2)', pts: ptsR },
      ];

      series.forEach(({ key, color, pts }) => {
        const line = svgEl('path', {
          d: smoothPath(pts),
          fill: 'none',
          stroke: color,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
          class: `serie serie--${key}` + (visivel[key] ? '' : ' is-hidden'),
        });
        svg.appendChild(line);
      });

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points' + (visivel.receita ? '' : ' is-hidden');
      ptsR.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top  = p[1] + '%';
        dot.style.transitionDelay = (0.6 + i * 0.02) + 's';
        points.appendChild(dot);
      });
      wrap.appendChild(points);

      const labelsEl = document.createElement('div');
      labelsEl.className = 'chart-labels';

      const mostrarTodas = labels.length <= 12;
      const step = mostrarTodas ? 1 : Math.ceil(labels.length / 6);
      const ultimo = labels.length - 1;

      labels.forEach((lb, i) => {
        if (!mostrarTodas && i % step !== 0 && i !== ultimo) return;
        const s = document.createElement('span');
        s.textContent = lb;
        s.style.left = (i / ultimo) * 100 + '%';
        labelsEl.appendChild(s);
      });
      wrap.appendChild(labelsEl);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => wrap.classList.add('is-ready'));
      });

      return wrap;
    };

    const render = () => {
      const data = DATASETS[periodoAtual];
      host.innerHTML = '';
      host.appendChild(build(data));
    };

    return { render };
  })();

  /* ===== TOGGLE DE SÉRIES (legendas) ===== */
  $$('.legend [data-serie]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.serie;
      visivel[key] = !visivel[key];
      el.classList.toggle('off', !visivel[key]);
      $$(`#chart .serie--${key}`).forEach(s => s.classList.toggle('is-hidden', !visivel[key]));
      if (key === 'receita') {
        $('#chart .chart-points')?.classList.toggle('is-hidden', !visivel.receita);
      }
    });
  });

  /* ===== ATUALIZA CARDS ===== */
  function atualizarBadge(badgeEl, variacao, invertido) {
    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;

    badgeEl.classList.remove('pos', 'neg');
    badgeEl.classList.add(bom ? 'pos' : 'neg');

    badgeEl.querySelector('.badge-icon path').setAttribute(
      'd',
      subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'
    );
    badgeEl.querySelector('.badge-value').textContent =
      Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
  }

  function atualizarCards(periodo) {
    const d = DATASETS[periodo];
    if (!d) return;

    const receitaTotal = d.receita.reduce((s, v) => s + v, 0);
    const despesaTotal = d.despesa.reduce((s, v) => s + v, 0);

    const rEl = $('.metrics .card:nth-child(1) .num');
    const dEl = $('.metrics .card:nth-child(2) .num');
    const rBadge = $('.metrics .card:nth-child(1) .card-badge');
    const dBadge = $('.metrics .card:nth-child(2) .card-badge');

    if (rEl) animateNumber(rEl, Math.round(receitaTotal), { duration: 700 });
    if (dEl) animateNumber(dEl, Math.round(despesaTotal), { duration: 700 });
    if (rBadge) atualizarBadge(rBadge, d.variacaoReceita, false);
    if (dBadge) atualizarBadge(dBadge, d.variacaoDespesa, true);
  }

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
      svg.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), opacity .4s ease';
      svg.style.transform = 'scale(1)';
      svg.style.opacity = '1';
    });
  };

  /* ===== BARRAS VERTICAIS ===== */
  const Bars = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    const VW = 360, VH = 170;
    const pad = { t: 12, r: 4, b: 24, l: 4 };
    const iw = VW - pad.l - pad.r;
    const ih = VH - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const step = iw / data.length;
    const bw = step * 0.55;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${VW} ${VH}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    });

    const grid = svgEl('g', {
      stroke: 'var(--chart-grid)',
      'stroke-width': '1',
      'vector-effect': 'non-scaling-stroke',
    });
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
      bar.style.transition = `y .7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s,` +
                             ` height .7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`;
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
      if (data.length > 8 && i % 2 !== 0) return;
      const t = svgEl('text', { x: pad.l + i * step + step / 2, y: VH - 8 });
      t.textContent = d.label;
      labelG.appendChild(t);
    });
    svg.appendChild(labelG);

    host.innerHTML = '';
    host.appendChild(svg);
  };

  /* ===== BARRAS HORIZONTAIS (estoque) ===== */
  const StockList = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    host.innerHTML = '';
    data.forEach(d => {
      const pct = Math.min(100, (d.value / d.max) * 100);
      const critico = pct < 20;
      const baixo = pct >= 20 && pct < 35;

      const row = document.createElement('div');
      row.className = 'hbar' + (critico ? ' is-critical' : baixo ? ' is-low' : '');
      row.innerHTML = `
        <div class="hbar-head">
          <span class="hbar-label">${d.label}</span>
          <span class="hbar-value">${d.value}<small>/${d.max}</small></span>
        </div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width:0%"></div>
        </div>
      `;
      host.appendChild(row);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.hbar-fill').style.width = pct + '%';
        });
      });
    });
  };

  /* ===== TOP PRODUTOS ===== */
  const TopList = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    const max = Math.max(...data.map(d => d.value));

    host.innerHTML = '';
    data.forEach((d, i) => {
      const pct = (d.value / max) * 100;
      const item = document.createElement('div');
      item.className = 'top-item';
      item.innerHTML = `
        <span class="top-rank">${i + 1}</span>
        <div class="top-info">
          <span class="top-name">${d.label}</span>
          <div class="top-bar"><div class="top-bar-fill" style="width:0%"></div></div>
        </div>
        <span class="top-value">${d.display || d.value}</span>
      `;
      host.appendChild(item);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.querySelector('.top-bar-fill').style.width = pct + '%';
        });
      });
    });
  };

  /* ===== RENDER GERAL ===== */
  function renderAll(periodo) {
    periodoAtual = periodo;
    const d = DATASETS[periodo];
    if (!d) return;

    Chart.render();
    atualizarCards(periodo);
    Donut('donutCategorias', d.categorias);
    Donut('donutOrigem', d.origem);
    Bars('barPeriodo', d.barras);
    TopList('topProdutos', d.topProdutos);
    StockList('estoqueCritico', ESTOQUE);
  }

  /* ===== CHIPS DE PERÍODO ===== */
  $$('.range-picker .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.range-picker .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderAll(chip.dataset.period || '1a');
    });
  });

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

  /* ===== BOOT ===== */
  const boot = () => {
    startClock();
    renderAll('1a');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Dash = { renderAll, animateNumber, runCounters };
})();