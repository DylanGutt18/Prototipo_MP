/* ==========================================================================
   prototipo.js — menu · gráficos · período · popovers · toast · busca
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

  /* ===== MOEDA ===== */
  const CURRENCY_LOCALE = { BRL: 'pt-BR', USD: 'en-US', EUR: 'de-DE' };

  function formatMoney(value, opts = {}) {
    const s = window.Settings?.get?.() || {};
    const currency = opts.currency || s.currency || 'BRL';
    const decimals = opts.decimals ?? s.decimals ?? 0;
    const compact = opts.compact ?? true;

    const options = {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    };
    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
    }
    return new Intl.NumberFormat(
      CURRENCY_LOCALE[currency] || 'pt-BR',
      options
    ).format(value);
  }

  /* ===== DATASETS ===== */
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
        { label: 'Seg', value: 4.5 },{ label: 'Ter', value: 5.2 },
        { label: 'Qua', value: 4.8 },{ label: 'Qui', value: 5.5 },
        { label: 'Sex', value: 6.2 },{ label: 'Sáb', value: 3.8 },
        { label: 'Dom', value: 2.1 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 12000 },
        { label: 'Monitor 27"',     value: 9000 },
        { label: 'Teclado Mec.',    value: 7000 },
        { label: 'Headset BT',      value: 5000 },
        { label: 'Mouse Ergo',      value: 3000 },
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
        { label: 'Out', value: 24 },{ label: 'Nov', value: 28 },
        { label: 'Dez', value: 31 },{ label: 'Jan', value: 26 },
        { label: 'Fev', value: 30 },{ label: 'Mar', value: 34 },
        { label: 'Abr', value: 29 },{ label: 'Mai', value: 33 },
        { label: 'Jun', value: 36 },{ label: 'Jul', value: 31 },
        { label: 'Ago', value: 38 },{ label: 'Set', value: 41 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 34000 },
        { label: 'Monitor 27"',     value: 27000 },
        { label: 'Teclado Mec.',    value: 21000 },
        { label: 'Headset BT',      value: 15000 },
        { label: 'Mouse Ergo',      value: 10000 },
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
        { label: 'Notebook Pro 15', value: 128000 },
        { label: 'Monitor 27"',     value: 96000 },
        { label: 'Teclado Mec.',    value: 78000 },
        { label: 'Headset BT',      value: 54000 },
        { label: 'Mouse Ergo',      value: 34000 },
      ],
    },
  };

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

  $$('.pop-item[data-action]').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      mostrarToast(ACOES_AJUDA[item.dataset.action] || `Ação: ${item.dataset.action}`);
      fecharPops();
    });
  });

  /* ===== ANIMAÇÃO DE NÚMEROS ===== */
  function animateNumber(el, to, { duration = 700, decimals = 0 } = {}) {
    const from = parseFloat(el.dataset.current || 0);
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toString();
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = decimals ? to.toFixed(decimals).replace('.', ',') : Math.round(to).toString();
        el.dataset.current = to;
      }
    };
    requestAnimationFrame(frame);
  }

  function animateMoney(el, to, duration = 700) {
    const from = parseFloat(el.dataset.current || 0);
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = formatMoney(v);
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = formatMoney(to);
        el.dataset.current = to;
      }
    };
    requestAnimationFrame(frame);
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

    let chartData = null;

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
        d: areaD, fill: 'url(#gArea)', opacity: '0',
        class: 'serie serie--receita' + (visivel.receita ? '' : ' is-hidden'),
      });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      [
        { key: 'despesa', color: 'var(--chart-1)', pts: ptsD },
        { key: 'receita', color: 'var(--chart-2)', pts: ptsR },
      ].forEach(({ key, color, pts }) => {
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

      // hover / tooltip
      const hoverLayer = document.createElement('div');
      hoverLayer.className = 'chart-hover';
      const cursor = document.createElement('div');
      cursor.className = 'chart-cursor';
      hoverLayer.appendChild(cursor);
      wrap.appendChild(hoverLayer);

      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      wrap.appendChild(tooltip);

      chartData = { ptsR, ptsD, labels, n, receita, despesa };

      hoverLayer.addEventListener('mousemove', e => {
        if (!chartData) return;
        const rect = wrap.getBoundingClientRect();
        const padL = 8, padR = 8, padT = 16, padB = 28;
        const innerW = rect.width - padL - padR;
        const x = e.clientX - rect.left - padL;
        const ratio = Math.max(0, Math.min(1, x / innerW));
        const idx = Math.round(ratio * (chartData.n - 1));

        const pR = chartData.ptsR[idx];
        const pD = chartData.ptsD[idx];

        cursor.style.left = pR[0] + '%';

        const label = chartData.labels[idx];
        const labelPrefix = periodoAtual === '1a' ? 'Mês'
                          : periodoAtual === '90d' ? 'Semana' : 'Dia';

        tooltip.innerHTML = `
          <div class="tt-label">${labelPrefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Receita</span>
            <span class="tt-val">${formatMoney(chartData.receita[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Despesa</span>
            <span class="tt-val">${formatMoney(chartData.despesa[idx] * 1000)}</span>
          </div>
        `;

        // posiciona acima do ponto mais alto
        const topY = Math.min(pR[1], pD[1]);
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pR[0] + '%';
        tooltip.style.top  = topPos + '%';
        tooltip.classList.add('is-visible');
        hoverLayer.classList.add('is-active');
      });

      hoverLayer.addEventListener('mouseleave', () => {
        tooltip.classList.remove('is-visible');
        hoverLayer.classList.remove('is-active');
      });

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

  /* ===== TOGGLE DE SÉRIES ===== */
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

  /* ===== BADGE ===== */
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

    const receitaTotal = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const despesaTotal = d.despesa.reduce((s, v) => s + v, 0) * 1000;

    const rEl = $('#cardReceita .num');
    const dEl = $('#cardDespesa .num');
    const rBadge = $('#cardReceita .card-badge');
    const dBadge = $('#cardDespesa .card-badge');

    if (rEl) animateMoney(rEl, receitaTotal);
    if (dEl) animateMoney(dEl, despesaTotal);
    if (rBadge) atualizarBadge(rBadge, d.variacaoReceita, false);
    if (dBadge) atualizarBadge(dBadge, d.variacaoDespesa, true);
  }

  /* ===== DONUT INTERATIVO ===== */
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
    const slices = [];
    data.forEach(d => {
      const len = (d.value / total) * circ;
      const slice = svgEl('circle', {
        cx, cy, r, fill: 'none',
        stroke: `var(${d.color})`,
        'stroke-width': stroke,
        'stroke-dasharray': `${len} ${circ - len}`,
        'stroke-dashoffset': -acc,
        transform: `rotate(-90 ${cx} ${cy})`,
        class: 'donut-slice',
      });
      slice.dataset.label = d.label;
      slice.dataset.value = d.value;
      slice.dataset.pct = Math.round((d.value / total) * 100);
      svg.appendChild(slice);
      slices.push(slice);
      acc += len;
    });

    // texto central — 2 linhas (label em cima, valor embaixo)
    const labelEl = svgEl('text', {
      x: cx, y: cy - 2,
      class: 'donut-center-label',
    });
    labelEl.textContent = 'Total';
    svg.appendChild(labelEl);

    const valueEl = svgEl('text', {
      x: cx, y: cy + 16,
      class: 'donut-center-value',
    });
    valueEl.textContent = total;
    svg.appendChild(valueEl);

    host.innerHTML = '';
    host.appendChild(svg);

    // interações
    slices.forEach(slice => {
      slice.addEventListener('mouseenter', () => {
        slice.setAttribute('stroke-width', String(stroke + 4));
        labelEl.textContent = slice.dataset.label;
        valueEl.textContent = slice.dataset.pct + '%';
      });
      slice.addEventListener('mouseleave', () => {
        slice.setAttribute('stroke-width', String(stroke));
        labelEl.textContent = 'Total';
        valueEl.textContent = total;
      });
    });

    // legenda interativa
    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    data.forEach((d, i) => {
      const pct = Math.round((d.value / total) * 100);
      const item = document.createElement('span');
      item.innerHTML = `<i style="background:var(${d.color})"></i>${d.label}<b>${pct}%</b>`;
      item.addEventListener('mouseenter', () => {
        slices[i].setAttribute('stroke-width', String(stroke + 4));
        labelEl.textContent = d.label;
        valueEl.textContent = pct + '%';
      });
      item.addEventListener('mouseleave', () => {
        slices[i].setAttribute('stroke-width', String(stroke));
        labelEl.textContent = 'Total';
        valueEl.textContent = total;
      });
      legend.appendChild(item);
    });
    host.appendChild(legend);

    requestAnimationFrame(() => {
      svg.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), opacity .4s ease';
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
    const bw = step * 0.55;

    const svg = svgEl('svg', {
      viewBox: `0 0 ${VW} ${VH}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    });

    const grid = svgEl('g', {
      stroke: 'var(--chart-grid)', 'stroke-width': '1',
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

  /* ===== ESTOQUE ===== */
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
        <span class="top-value">${formatMoney(d.value)}</span>
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
    periodoAtual = periodo || periodoAtual;
    const d = DATASETS[periodoAtual];
    if (!d) return;

    Chart.render();
    atualizarCards(periodoAtual);
    Donut('donutCategorias', d.categorias);
    Donut('donutOrigem', d.origem);
    Bars('barPeriodo', d.barras);
    TopList('topProdutos', d.topProdutos);
    StockList('estoqueCritico', ESTOQUE);
  }

  /* ===== CHIPS DE PERÍODO ===== */
  function setPeriodo(p) {
    if (!DATASETS[p]) return;
    periodoAtual = p;
    $$('.range-picker .chip').forEach(c =>
      c.classList.toggle('active', c.dataset.period === p)
    );
    renderAll(p);
  }

  $$('.range-picker .chip').forEach(chip => {
    chip.addEventListener('click', () => setPeriodo(chip.dataset.period));
  });

  /* ===== MODO APRESENTAÇÃO ===== */
  function setPresentation(on) {
    document.body.classList.toggle('presentation-mode', on);
    const exit = $('#presentationExit');
    if (exit) exit.hidden = !on;
    if (on) {
      // fecha painel de configs se estiver aberto
      window.Settings?.close?.();
    }
  }

  $('#presentationExit')?.addEventListener('click', () => {
    setPresentation(false);
    window.Settings?.set?.('presentation', false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('presentation-mode')) {
      setPresentation(false);
      window.Settings?.set?.('presentation', false);
    }
  });

  /* ===== BUSCA ===== */
  const SEARCH_TARGETS = [
    { id: 'contentHeader',   label: 'Visão Geral',            keywords: ['visão', 'geral', 'resumo', 'home'] },
    { id: 'cardReceita',     label: 'Receita do período',     keywords: ['receita', 'entrada', 'ganho'] },
    { id: 'cardDespesa',     label: 'Despesa do período',     keywords: ['despesa', 'gasto', 'saída'] },
    { id: 'panelGrafico',    label: 'Receita × Despesa',      keywords: ['gráfico', 'comparativo', 'linha'] },
    { id: 'panelCategorias', label: 'Gastos por categoria',   keywords: ['categoria', 'gastos', 'marketing', 'salários', 'operacional', 'infraestrutura'] },
    { id: 'panelOrigem',     label: 'Origem da receita',      keywords: ['origem', 'recorrente', 'novos'] },
    { id: 'panelBarras',     label: 'Receita no período',     keywords: ['barras', 'receita'] },
    { id: 'panelEstoque',    label: 'Estoque crítico',        keywords: ['estoque', 'produto', 'inventário', 'crítico'] },
    { id: 'panelTop',        label: 'Top produtos',           keywords: ['top', 'produtos', 'vendas', 'mais vendidos'] },
    // produtos individuais
    ...['Notebook Pro 15', 'Monitor 27"', 'Teclado Mec.', 'Headset BT', 'Mouse Ergo'].map(name => ({
      id: 'panelTop',
      label: name,
      keywords: [name.toLowerCase()],
      child: name,
    })),
  ];

  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  let activeResultIdx = -1;

  function normalizar(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function buscar(termo) {
    const q = normalizar(termo.trim());
    if (!q) return [];
    return SEARCH_TARGETS.filter(t => {
      const alvo = normalizar(t.label);
      const keys = t.keywords.map(normalizar).join(' ');
      return alvo.includes(q) || keys.includes(q);
    }).slice(0, 8);
  }

  function mostrarResultados(lista) {
    searchResults.innerHTML = '';
    activeResultIdx = -1;

    if (!lista.length) {
      searchResults.innerHTML = '<div class="search-empty">Nada encontrado</div>';
      searchResults.classList.add('is-open');
      return;
    }

    lista.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'search-result';
      btn.dataset.targetId = t.id;
      btn.dataset.child = t.child || '';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/>
        </svg>
        <span>${t.label}</span>
      `;
      btn.addEventListener('click', () => irPara(t));
      searchResults.appendChild(btn);
    });
    searchResults.classList.add('is-open');
  }

  function fecharResultados() {
    searchResults.classList.remove('is-open');
    activeResultIdx = -1;
  }

  function irPara(t) {
    const target = document.getElementById(t.id);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      target.classList.remove('is-highlighted');
      void target.offsetWidth;
      target.classList.add('is-highlighted');
      setTimeout(() => target.classList.remove('is-highlighted'), 2100);
    }, 420);

    fecharResultados();
    searchInput.value = '';
    searchInput.blur();
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const lista = buscar(searchInput.value);
      if (!searchInput.value.trim()) return fecharResultados();
      mostrarResultados(lista);
    });

    searchInput.addEventListener('keydown', e => {
      const items = $$('.search-result');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-active', i === activeResultIdx));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-active', i === activeResultIdx));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = activeResultIdx >= 0 ? activeResultIdx : 0;
        items[idx]?.click();
      } else if (e.key === 'Escape') {
        fecharResultados();
        searchInput.blur();
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) {
        mostrarResultados(buscar(searchInput.value));
      }
    });
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.search')) fecharResultados();
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

  /* ===== REAGE A MUDANÇAS DE PREFERÊNCIAS ===== */
  document.addEventListener('settings:change', () => {
    // re-renderiza com novo formato de moeda / casas decimais
    renderAll(periodoAtual);
    setPresentation(window.Settings?.get?.('presentation'));
  });

  /* ===== BOOT ===== */
  const boot = () => {
    startClock();
    const defaultPeriod = window.Settings?.get?.('defaultPeriod') || '1a';
    setPeriodo(defaultPeriod);
    setPresentation(window.Settings?.get?.('presentation'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Dash = {
    renderAll,
    setPeriodo,
    animateNumber,
    formatMoney,
    setPresentation,
  };
})();