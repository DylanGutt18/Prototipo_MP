/* ==========================================================================
   profits.js — View "Lucros"
   Consome window.Dash para moeda, filiais, período, contadores e settings.
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[profits] window.Dash não existe. Verifique a ordem dos scripts (prototipo.js antes de profits.js).');
    return;
  }

  const Dash = window.Dash;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

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

  /* ===== HOSTS ===== */
  const viewHost = $('.view[data-view="lucros"]');
  if (!viewHost) return;

  const elCardReceita = $('#lucrosCardReceita');
  const elCardCustos  = $('#lucrosCardCustos');
  const elCardLucro   = $('#lucrosCardLucro');
  const elCardMargem  = $('#lucrosCardMargem');
  const elMargemVal   = $('#lucrosMargemValor');
  const elChartHost   = $('#chartLucros');
  const elDonutCustos = $('#donutCustosLucros');
  const elDonutOrigem = $('#donutOrigemLucros');
  const elBarHost     = $('#barLucros');
  const elTableHost   = $('#tabelaLucros');
  const elFiliaisLbl  = $('#filiaisLabelLucros');

  /* ===== DADOS BASE (milhares) ===== */
  const DATA = {
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      receita: [14,16,13,18,17,20,19,21,23,20,24,22,25,23,21,26,24,27,25,23,28,26,27,25,29,28,26,30,29,31],
      custos:  [8,9,7,10,9,11,10,12,13,11,14,12,15,13,12,15,14,16,15,13,16,15,16,14,17,16,15,17,16,18],
      variacaoReceita: 6.4,
      variacaoCustos:  2.1,
      variacaoLucro:   9.8,
      variacaoMargem:  1.7,
      custosCategorias: [
        { label: 'Marketing',      value: 32, color: '--chart-1' },
        { label: 'Operacional',    value: 28, color: '--chart-2' },
        { label: 'Salários',       value: 26, color: '--chart-3' },
        { label: 'Infraestrutura', value: 14, color: '--chart-4' },
      ],
      origemLucro: [
        { label: 'Recorrente', value: 62, color: '--chart-2' },
        { label: 'Novos',      value: 38, color: '--chart-1' },
      ],
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      receita: [42, 48, 55, 52, 60, 68, 65, 72, 78, 74, 82, 88],
      custos:  [22, 25, 30, 28, 32, 36, 34, 38, 42, 40, 44, 48],
      variacaoReceita: 12.6,
      variacaoCustos:  4.2,
      variacaoLucro:   18.3,
      variacaoMargem:  3.1,
      custosCategorias: [
        { label: 'Marketing',      value: 28, color: '--chart-1' },
        { label: 'Operacional',    value: 30, color: '--chart-2' },
        { label: 'Salários',       value: 27, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origemLucro: [
        { label: 'Recorrente', value: 65, color: '--chart-2' },
        { label: 'Novos',      value: 35, color: '--chart-1' },
      ],
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      receita: [128, 164, 152, 184, 208, 196, 224, 248, 236, 272, 284, 304],
      custos:  [72,  84,  80,  96,  104, 100, 112, 124, 120, 136, 140, 148],
      variacaoReceita: 18.4,
      variacaoCustos:  6.1,
      variacaoLucro:   26.7,
      variacaoMargem:  4.2,
      custosCategorias: [
        { label: 'Marketing',      value: 35, color: '--chart-1' },
        { label: 'Operacional',    value: 30, color: '--chart-2' },
        { label: 'Salários',       value: 20, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origemLucro: [
        { label: 'Recorrente', value: 68, color: '--chart-2' },
        { label: 'Novos',      value: 32, color: '--chart-1' },
      ],
    },
  };

  const PRODUCTS_BASE = [
    { name: 'Plano Pro',        receita: 410, custo: 140 },
    { name: 'Plano Starter',    receita: 285, custo: 128 },
    { name: 'Add-on Analytics', receita: 176, custo: 47  },
    { name: 'Consultoria',      receita: 125, custo: 72  },
    { name: 'Treinamento',      receita: 79,  custo: 32  },
  ];

  const PRODUCT_SCALE = { '30d': 1, '90d': 3, '1a': 12 };

  /* ===== DADOS FILTRADOS ===== */
  function getDados() {
    const periodo = Dash.getPeriod();
    const base = DATA[periodo] || DATA['1a'];

    const sel = Dash.getSelectedBranches();
    const pesoR = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0);
    const pesoC = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoDespesa || 0), 0);
    const mult = Dash.MULT;

    const receita = base.receita.map(v => v * pesoR * mult);
    const custos  = base.custos.map(v => v * pesoC * mult);
    const lucro   = receita.map((r, i) => r - custos[i]);

    return {
      labels: base.labels,
      receita,
      custos,
      lucro,
      variacaoReceita: base.variacaoReceita,
      variacaoCustos:  base.variacaoCustos,
      variacaoLucro:   base.variacaoLucro,
      variacaoMargem:  base.variacaoMargem,
      custosCategorias: base.custosCategorias,
      origemLucro: base.origemLucro,
    };
  }

  function getProdutos() {
    const periodo = Dash.getPeriod();
    const scale = PRODUCT_SCALE[periodo] || 1;
    const sel = Dash.getSelectedBranches();
    const pesoR = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0);
    const pesoC = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoDespesa || 0), 0);
    const mult = Dash.MULT;

    return PRODUCTS_BASE.map(p => {
      const receita = p.receita * scale * pesoR * mult * 1000;
      const custo   = p.custo   * scale * pesoC * mult * 1000;
      const lucro   = receita - custo;
      const margem  = receita > 0 ? (lucro / receita) * 100 : 0;
      return { name: p.name, receita, custo, lucro, margem };
    });
  }

  /* ===== AGREGAÇÃO DE LUCRO PARA AS BARRAS ===== */
  function aggregateLucro(lucro) {
    const p = Dash.getPeriod();

    if (p === '30d') {
      const groups = 4;
      const size = Math.ceil(lucro.length / groups);
      const out = [];
      for (let g = 0; g < groups; g++) {
        const slice = lucro.slice(g * size, (g + 1) * size);
        out.push({
          label: `S${g + 1}`,
          value: slice.reduce((s, v) => s + v, 0),
        });
      }
      return out;
    }

    if (p === '90d') {
      const groups = 3;
      const size = Math.ceil(lucro.length / groups);
      const out = [];
      for (let g = 0; g < groups; g++) {
        const slice = lucro.slice(g * size, (g + 1) * size);
        out.push({
          label: `Mês ${g + 1}`,
          value: slice.reduce((s, v) => s + v, 0),
        });
      }
      return out;
    }

    // 1a → 4 trimestres
    const out = [];
    for (let g = 0; g < 4; g++) {
      const slice = lucro.slice(g * 3, (g + 1) * 3);
      out.push({
        label: `Q${g + 1}`,
        value: slice.reduce((s, v) => s + v, 0),
      });
    }
    return out;
  }

  /* ===== LABEL DE FILIAIS ===== */
  function atualizarFiliaisLabel() {
    if (!elFiliaisLbl) return;
    const sel = Dash.getSelectedBranches();
    const total = Object.keys(Dash.FILIAIS).length;
    if (sel.length === total) elFiliaisLbl.textContent = 'Todas as filiais';
    else if (sel.length === 1) elFiliaisLbl.textContent = Dash.FILIAIS[sel[0]].nome;
    else elFiliaisLbl.textContent = sel.map(k => Dash.FILIAIS[k].nome).join(' + ');
  }

  /* ===== BADGE ===== */
  function atualizarBadge(card, variacao, invertido) {
    if (!card) return;
    const badge = card.querySelector('.card-badge');
    if (!badge) return;

    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;

    badge.classList.remove('pos', 'neg', 'up', 'down');
    badge.classList.add(bom ? 'pos' : 'neg');

    const icon = badge.querySelector('.badge-icon path');
    if (icon) icon.setAttribute('d', subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6');

    const valEl = badge.querySelector('.badge-value');
    if (valEl) valEl.textContent = Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
  }

  /* ===== CARDS ===== */
  function renderCards() {
    const d = getDados();
    const receitaTotal = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const custosTotal  = d.custos.reduce((s, v) => s + v, 0) * 1000;
    const lucroTotal   = receitaTotal - custosTotal;
    const margem       = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    const setNum = (card, valor) => {
      const el = card?.querySelector('.num');
      if (el) Dash.animateMoney(el, valor);
    };

    setNum(elCardReceita, receitaTotal);
    setNum(elCardCustos, custosTotal);
    setNum(elCardLucro, lucroTotal);

    if (elMargemVal) Dash.animateNumber(elMargemVal, margem, { decimals: 1 });

    atualizarBadge(elCardReceita, d.variacaoReceita, false);
    atualizarBadge(elCardCustos,  d.variacaoCustos,  true);
    atualizarBadge(elCardLucro,   d.variacaoLucro,   false);
    atualizarBadge(elCardMargem,  d.variacaoMargem,  false);
  }

  /* ===== GRÁFICO DE LINHA ===== */
  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const data = getDados();
      const { receita, custos, lucro, labels } = data;

      const max = Math.max(...receita, ...custos, ...lucro) * 1.12;
      const n = receita.length;
      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => (1 - v / max) * 100;

      const ptsR = receita.map((v, i) => [xAt(i), yAt(v)]);
      const ptsC = custos.map((v, i) => [xAt(i), yAt(v)]);
      const ptsL = lucro.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gProfitArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-3)', 'stop-opacity': '.28' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-3)', 'stop-opacity': '0' }));
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

      const areaD = smoothPath(ptsL) + ` L 100 100 L 0 100 Z`;
      const area = svgEl('path', { d: areaD, fill: 'url(#gProfitArea)', opacity: '0' });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      [
        { color: 'var(--chart-1)', pts: ptsR },
        { color: 'var(--chart-2)', pts: ptsC },
        { color: 'var(--chart-3)', pts: ptsL },
      ].forEach(({ color, pts }) => {
        const line = svgEl('path', {
          d: smoothPath(pts), fill: 'none', stroke: color,
          'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
        });
        svg.appendChild(line);
      });

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points';
      ptsL.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top  = p[1] + '%';
        dot.style.background = 'var(--chart-3)';
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

      const hoverLayer = document.createElement('div');
      hoverLayer.className = 'chart-hover';
      const cursor = document.createElement('div');
      cursor.className = 'chart-cursor';
      hoverLayer.appendChild(cursor);
      wrap.appendChild(hoverLayer);

      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      wrap.appendChild(tooltip);

      chartData = { ptsR, ptsC, ptsL, labels, n, receita, custos, lucro };

      let pinnedIdx = -1;
      let hideTimer = null;

      function idxFromClientX(clientX) {
        const rect = wrap.getBoundingClientRect();
        const padL = 8, padR = 8;
        const innerW = rect.width - padL - padR;
        const x = clientX - rect.left - padL;
        const ratio = Math.max(0, Math.min(1, x / innerW));
        return Math.round(ratio * (chartData.n - 1));
      }

      function showTooltipAt(idx) {
        const pL = chartData.ptsL[idx];
        const label = chartData.labels[idx];
        const p = Dash.getPeriod();
        const prefix = p === '1a' ? 'Mês' : p === '90d' ? 'Semana' : 'Dia';

        cursor.style.left = pL[0] + '%';

        tooltip.innerHTML = `
          <div class="tt-label">${prefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Receita</span>
            <span class="tt-val">${Dash.formatMoney(chartData.receita[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Custos</span>
            <span class="tt-val">${Dash.formatMoney(chartData.custos[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-3)"></i>Lucro</span>
            <span class="tt-val">${Dash.formatMoney(chartData.lucro[idx] * 1000)}</span>
          </div>
        `;

        const rect = wrap.getBoundingClientRect();
        const padT = 16, padB = 28;
        const topY = Math.min(
          chartData.ptsR[idx][1],
          chartData.ptsC[idx][1],
          chartData.ptsL[idx][1]
        );
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pL[0] + '%';
        tooltip.style.top  = topPos + '%';
        tooltip.classList.add('is-visible');
        hoverLayer.classList.add('is-active');
      }

      function hideTooltip() {
        tooltip.classList.remove('is-visible');
        hoverLayer.classList.remove('is-active');
        pinnedIdx = -1;
      }

      hoverLayer.addEventListener('mousemove', e => {
        if (pinnedIdx !== -1) return;
        showTooltipAt(idxFromClientX(e.clientX));
      });
      hoverLayer.addEventListener('mouseleave', () => {
        if (pinnedIdx !== -1) return;
        hideTooltip();
      });
      hoverLayer.addEventListener('click', e => {
        e.stopPropagation();
        if (pinnedIdx === -1) {
          const idx = idxFromClientX(e.clientX);
          showTooltipAt(idx);
          pinnedIdx = idx;
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hideTooltip, 5000);
        } else {
          hideTooltip();
        }
      });
      hoverLayer.addEventListener('touchstart', e => {
        const t = e.touches[0];
        if (!t) return;
        showTooltipAt(idxFromClientX(t.clientX));
        pinnedIdx = idxFromClientX(t.clientX);
        clearTimeout(hideTimer);
      }, { passive: true });
      hoverLayer.addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (!t) return;
        showTooltipAt(idxFromClientX(t.clientX));
        pinnedIdx = idxFromClientX(t.clientX);
        clearTimeout(hideTimer);
      }, { passive: true });
      hoverLayer.addEventListener('touchend', () => {
        hideTimer = setTimeout(hideTooltip, 2500);
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => wrap.classList.add('is-ready'));
      });

      return wrap;
    }

    function render() {
      elChartHost.innerHTML = '';
      elChartHost.appendChild(build());
    }

    return { render };
  })();

  /* ===== DONUT ===== */
  function Donut(host, data, totalBRL) {
    if (!host) return;
    const size = 140, stroke = 18;
    const r = (size - stroke) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const totalPct = data.reduce((s, d) => s + d.value, 0) || 1;

    const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}` });
    svg.appendChild(svgEl('circle', {
      cx, cy, r, fill: 'none',
      stroke: 'var(--bg-3)', 'stroke-width': stroke,
    }));

    const groups = [];
    let acc = 0;

    data.forEach((d) => {
      const len = (d.value / totalPct) * circ;
      const midAngle = (-90 + ((acc + len / 2) / circ) * 360) * Math.PI / 180;
      const g = svgEl('g', { class: 'donut-slice-group' });
      const slice = svgEl('circle', {
        cx, cy, r, fill: 'none',
        stroke: `var(${d.color})`,
        'stroke-width': stroke,
        'stroke-dasharray': `${len} ${circ - len}`,
        'stroke-dashoffset': -acc,
        transform: `rotate(-90 ${cx} ${cy})`,
        class: 'donut-slice',
      });
      g.appendChild(slice);
      svg.appendChild(g);

      const actualBRL = (d.value / totalPct) * totalBRL;
      groups.push({
        g, slice, midAngle, actualBRL,
        pct: Math.round((d.value / totalPct) * 100),
        label: d.label,
      });
      acc += len;
    });

    const labelEl = svgEl('text', { x: cx, y: cy - 3, class: 'donut-center-label' });
    labelEl.textContent = 'Total';
    svg.appendChild(labelEl);

    const valueEl = svgEl('text', { x: cx, y: cy + 15, class: 'donut-center-value' });
    valueEl.textContent = Dash.formatMoney(totalBRL);
    svg.appendChild(valueEl);

    host.innerHTML = '';
    host.appendChild(svg);

    let activeIdx = -1;

    function activate(i) {
      activeIdx = i;
      groups.forEach((grp, idx) => {
        const isActive = idx === i;
        const dimmed = i !== -1 && !isActive;
        if (isActive) {
          const dx = Math.cos(grp.midAngle) * 9;
          const dy = Math.sin(grp.midAngle) * 9;
          grp.g.style.transform = `translate(${dx}px, ${dy}px)`;
          grp.g.style.opacity = '1';
          grp.slice.setAttribute('stroke-width', String(stroke + 2));
        } else {
          grp.g.style.transform = 'translate(0, 0)';
          grp.g.style.opacity = dimmed ? '0.35' : '1';
          grp.slice.setAttribute('stroke-width', String(stroke));
        }
      });
      if (i === -1) {
        labelEl.textContent = 'Total';
        valueEl.textContent = Dash.formatMoney(totalBRL);
      } else {
        labelEl.textContent = groups[i].label;
        valueEl.textContent = Dash.formatMoney(groups[i].actualBRL);
      }
    }

    groups.forEach((grp, i) => {
      grp.g.addEventListener('click', (e) => {
        e.stopPropagation();
        activate(activeIdx === i ? -1 : i);
      });
      grp.g.addEventListener('mouseenter', () => {
        if (activeIdx === -1) grp.slice.setAttribute('stroke-width', String(stroke + 2));
      });
      grp.g.addEventListener('mouseleave', () => {
        if (activeIdx === -1) grp.slice.setAttribute('stroke-width', String(stroke));
      });
    });

    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    groups.forEach((grp, i) => {
      const item = document.createElement('span');
      item.innerHTML = `<i style="background:var(${data[i].color})"></i>${grp.label}<b>${grp.pct}%</b>`;
      item.addEventListener('click', () => activate(activeIdx === i ? -1 : i));
      legend.appendChild(item);
    });
    host.appendChild(legend);
  }

  /* ===== BARRAS VERTICAIS ===== */
  function Bars(host, data) {
    if (!host) return;

    const VW = 360, VH = 170;
    const pad = { t: 12, r: 4, b: 24, l: 4 };
    const iw = VW - pad.l - pad.r;
    const ih = VH - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const step = iw / data.length;
    const bw = step * 0.55;

    const wrap = document.createElement('div');
    wrap.className = 'bar-inner';

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
    const gid = 'barG-profit';
    const grad = svgEl('linearGradient', { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--accent)', 'stop-opacity': '1' }));
    grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--accent-2)', 'stop-opacity': '.35' }));
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
      bar.style.transition = `y .7s cubic-bezier(.16,1,.3,1) ${i * 0.05}s,` +
                             ` height .7s cubic-bezier(.16,1,.3,1) ${i * 0.05}s`;
      requestAnimationFrame(() => {
        bar.setAttribute('y', y);
        bar.setAttribute('height', h);
      });
    });

    const labelG = svgEl('g', {
      fill: 'var(--chart-label)', 'font-size': '10',
      'font-family': 'JetBrains Mono, monospace', 'text-anchor': 'middle',
    });
    data.forEach((d, i) => {
      const t = svgEl('text', { x: pad.l + i * step + step / 2, y: VH - 8 });
      t.textContent = d.label;
      labelG.appendChild(t);
    });
    svg.appendChild(labelG);

    wrap.appendChild(svg);

    const hover = document.createElement('div');
    hover.className = 'bar-hover';

    data.forEach((d, i) => {
      const barX = pad.l + i * step + (step - bw) / 2;
      const h = (d.value / max) * ih;
      const y = pad.t + ih - h;

      const zone = document.createElement('span');
      zone.className = 'bar-hover-zone';
      zone.style.left = (pad.l + i * step) / VW * 100 + '%';
      zone.style.width = step / VW * 100 + '%';
      zone.style.top = Math.max(0, y / VH * 100) + '%';
      zone.style.height = (pad.t + ih - y) / VH * 100 + '%';
      zone.dataset.idx = i;
      zone.dataset.label = d.label;
      zone.dataset.money = Dash.formatMoney(d.value * 1000);
      zone.dataset.tipLeft = ((barX + bw / 2) / VW * 100) + '%';
      zone.dataset.tipTop = Math.max(0, y / VH * 100) + '%';
      hover.appendChild(zone);
    });
    wrap.appendChild(hover);

    const tooltip = document.createElement('div');
    tooltip.className = 'bar-tooltip';
    wrap.appendChild(tooltip);

    let pinnedIdx = -1;
    let hideTimer = null;

    function showTooltipFor(zone) {
      tooltip.innerHTML = `
        <div class="tt-label">${zone.dataset.label}</div>
        <div class="tt-val">${zone.dataset.money}</div>
      `;
      tooltip.style.left = zone.dataset.tipLeft;
      tooltip.style.top = zone.dataset.tipTop;
      tooltip.classList.add('is-visible');
    }

    function hideTooltip() {
      tooltip.classList.remove('is-visible');
      pinnedIdx = -1;
      hover.querySelectorAll('.bar-hover-zone').forEach(z => z.classList.remove('is-active'));
    }

    hover.querySelectorAll('.bar-hover-zone').forEach(zone => {
      zone.addEventListener('mouseenter', () => {
        if (pinnedIdx !== -1) return;
        showTooltipFor(zone);
      });
      zone.addEventListener('mouseleave', () => {
        if (pinnedIdx !== -1) return;
        tooltip.classList.remove('is-visible');
      });
      zone.addEventListener('click', e => {
        e.stopPropagation();
        const idx = +zone.dataset.idx;
        if (pinnedIdx === idx) {
          hideTooltip();
        } else {
          hideTooltip();
          showTooltipFor(zone);
          zone.classList.add('is-active');
          pinnedIdx = idx;
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hideTooltip, 5000);
        }
      });
      zone.addEventListener('touchstart', e => {
        e.stopPropagation();
        showTooltipFor(zone);
        zone.classList.add('is-active');
        pinnedIdx = +zone.dataset.idx;
        clearTimeout(hideTimer);
      }, { passive: true });
      zone.addEventListener('touchend', () => {
        hideTimer = setTimeout(hideTooltip, 2500);
      });
    });

    host.innerHTML = '';
    host.appendChild(wrap);
  }

  /* ===== TABELA ===== */
  function renderTable() {
    if (!elTableHost) return;
    const produtos = getProdutos();

    const head = `
      <div class="profit-row profit-head">
        <span>Produto</span>
        <span class="num">Receita</span>
        <span class="num">Lucro</span>
        <span class="num pct">Margem</span>
      </div>
    `;

    const rows = produtos.map(p => `
      <div class="profit-row">
        <span class="profit-name">${p.name}</span>
        <span class="num">${Dash.formatMoney(p.receita)}</span>
        <span class="num positive">${Dash.formatMoney(p.lucro)}</span>
        <span class="num pct">${p.margem.toFixed(1).replace('.', ',')}%</span>
      </div>
    `).join('');

    elTableHost.innerHTML = head + rows;
  }

  /* ===== RENDER ===== */
  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();

    const d = getDados();
    const custosTotal = d.custos.reduce((s, v) => s + v, 0) * 1000;
    const lucroTotal = d.lucro.reduce((s, v) => s + v, 0) * 1000;

    Chart.render();
    Donut(elDonutCustos, d.custosCategorias, custosTotal);
    Donut(elDonutOrigem, d.origemLucro, lucroTotal);

    Bars(elBarHost, aggregateLucro(d.lucro));

    renderTable();
  }

  /* ===== REGISTRO NA SPA ===== */
  Dash.registrarView('lucros', { onShow: renderAll });

  /* Se por algum motivo já estiver visível ao carregar, renderiza */
  if (Dash.getView() === 'lucros') {
    requestAnimationFrame(renderAll);
  }

  /* Re-render quando settings mudar enquanto essa view está aberta */
  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'lucros') renderAll();
  });
})();