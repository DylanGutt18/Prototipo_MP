/* ==========================================================================
   profits.js — View "Lucros"
   Consome a MESMA base da Visão Geral via Dash.getDataset().
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[profits] window.Dash não existe. Verifique a ordem dos scripts.');
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

  const viewHost = $('.view[data-view="lucros"]');
  if (!viewHost) return;

  const elCardReceita = $('#lucrosCardReceita');
  const elCardCustos  = $('#lucrosCardCustos');
  const elCardLucro   = $('#lucrosCardLucro');
  const elCardMargem  = $('#lucrosCardMargem');
  const elMargemVal   = $('#lucrosMargemValor');
  const elChartHost   = $('#chartLucros');
  const elDonutMix    = $('#donutMixReceita');
  const elDonutCustos = $('#donutCustosLucros');
  const elDonutOrigem = $('#donutOrigemLucros');
  const elBarHost     = $('#barLucros');
  const elMargemList  = $('#margemCategorias');
  const elTableHost   = $('#tabelaLucros');
  const elFiliaisLbl  = $('#filiaisLabelLucros');

  /* ===== MIX DE PRODUTOS =====
     share = fração da receita total do período.
     cmv   = custo da mercadoria/serviço como fração da receita daquele item.
     Somatório de `share` = 1 (garante que soma dos produtos = receita total).
  */
  const PRODUTOS = [
    { name: 'Notebook Pro 15',    tipo: 'hw', share: 0.0775, cmv: 0.375 },
    { name: 'Monitor 27"',        tipo: 'hw', share: 0.0581, cmv: 0.4375 },
    { name: 'Teclado Mecânico',   tipo: 'hw', share: 0.0472, cmv: 0.3333 },
    { name: 'Headset Bluetooth',  tipo: 'hw', share: 0.0327, cmv: 0.4074 },
    { name: 'Mouse Ergo',         tipo: 'hw', share: 0.0206, cmv: 0.3529 },
    { name: 'Plano Enterprise',   tipo: 'sw', share: 0.2542, cmv: 0.20 },
    { name: 'Plano Pro',          tipo: 'sw', share: 0.1598, cmv: 0.25 },
    { name: 'Plano Starter',      tipo: 'sw', share: 0.0871, cmv: 0.2917 },
    { name: 'Add-on Analytics',   tipo: 'sw', share: 0.0581, cmv: 0.1875 },
    { name: 'Add-on Suporte 24/7',tipo: 'sw', share: 0.0363, cmv: 0.40 },
    { name: 'Consultoria',        tipo: 'sv', share: 0.1090, cmv: 0.40 },
    { name: 'Treinamento',        tipo: 'sv', share: 0.0594, cmv: 0.3265 },
  ];

  const CUSTOS_MIX = [
    { label: 'Marketing',      pct: 0.35, color: '--chart-1' },
    { label: 'Operacional',    pct: 0.30, color: '--chart-2' },
    { label: 'Salários',       pct: 0.20, color: '--chart-3' },
    { label: 'Infraestrutura', pct: 0.15, color: '--chart-4' },
  ];

  const ORIGEM_MIX = [
    { label: 'Recorrente', pct: 0.60, color: '--chart-2' },
    { label: 'Pontual',    pct: 0.40, color: '--chart-1' },
  ];

  const TIPO_INFO = {
    hw: { nome: 'Hardware', cor: 'var(--accent-2)',       classe: 'profit-badge--hw', tone: 'tone-hw' },
    sw: { nome: 'Software', cor: 'var(--pos)',            classe: 'profit-badge--sw', tone: 'tone-sw' },
    sv: { nome: 'Serviço',  cor: '#f472b6',               classe: 'profit-badge--sv', tone: 'tone-sv' },
  };

  function getDataset() {
    const d = Dash.getDataset();
    if (!d) return null;
    return {
      labels: d.labels,
      receita: d.receita,
      custos: d.despesa,
      lucro: d.receita.map((r, i) => r - d.despesa[i]),
      variacaoReceita: d.variacaoReceita,
      variacaoCustos:  d.variacaoDespesa,
      variacaoLucro:  d.variacaoReceita - d.variacaoDespesa + 1.2,
      variacaoMargem: d.variacaoReceita * 0.15,
    };
  }

  function getProdutos() {
    const d = getDataset();
    if (!d) return [];
    const receitaTotal = d.receita.reduce((s, v) => s + v, 0);

    return PRODUTOS.map(p => {
      const receita = receitaTotal * p.share * 1000;
      const custo   = receita * p.cmv;
      const lucro   = receita - custo;
      const margem  = receita > 0 ? (lucro / receita) * 100 : 0;
      return { name: p.name, tipo: p.tipo, receita, custo, lucro, margem };
    });
  }

  function aggregateLucro(lucro) {
    const p = Dash.getPeriod();

    if (p === '30d') {
      const groups = 4;
      const size = Math.ceil(lucro.length / groups);
      const out = [];
      for (let g = 0; g < groups; g++) {
        const slice = lucro.slice(g * size, (g + 1) * size);
        out.push({ label: `S${g + 1}`, value: slice.reduce((s, v) => s + v, 0) });
      }
      return out;
    }
    if (p === '90d') {
      const groups = 3;
      const size = Math.ceil(lucro.length / groups);
      const out = [];
      for (let g = 0; g < groups; g++) {
        const slice = lucro.slice(g * size, (g + 1) * size);
        out.push({ label: `Mês ${g + 1}`, value: slice.reduce((s, v) => s + v, 0) });
      }
      return out;
    }
    const out = [];
    for (let g = 0; g < 4; g++) {
      const slice = lucro.slice(g * 3, (g + 1) * 3);
      out.push({ label: `Q${g + 1}`, value: slice.reduce((s, v) => s + v, 0) });
    }
    return out;
  }

  function atualizarFiliaisLabel() {
    if (!elFiliaisLbl) return;
    const sel = Dash.getSelectedBranches();
    const total = Object.keys(Dash.FILIAIS).length;
    if (sel.length === total) elFiliaisLbl.textContent = 'Todas as filiais';
    else if (sel.length === 1) elFiliaisLbl.textContent = Dash.FILIAIS[sel[0]].nome;
    else elFiliaisLbl.textContent = sel.map(k => Dash.FILIAIS[k].nome).join(' + ');
  }

  function atualizarBadge(card, variacao, invertido) {
    if (!card) return;
    const badge = card.querySelector('.card-badge');
    if (!badge) return;

    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;

    badge.classList.remove('pos', 'neg');
    badge.classList.add(bom ? 'pos' : 'neg');

    const icon = badge.querySelector('.badge-icon path');
    if (icon) icon.setAttribute('d', subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6');

    const valEl = badge.querySelector('.badge-value');
    if (valEl) valEl.textContent = Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
  }

  function renderCards() {
    const d = getDataset();
    if (!d) return;

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

  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const data = getDataset();
      if (!data) return document.createElement('div');

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
        stroke: 'var(--chart-grid)', 'stroke-width': '1',
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
        const topY = Math.min(chartData.ptsR[idx][1], chartData.ptsC[idx][1], chartData.ptsL[idx][1]);
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
        } else hideTooltip();
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
      const inner = svgEl('g', { class: 'donut-slice-visual' });

      const slice = svgEl('circle', {
        cx, cy, r, fill: 'none',
        stroke: `var(${d.color})`,
        'stroke-width': stroke,
        'stroke-dasharray': `${len} ${circ - len}`,
        'stroke-dashoffset': -acc,
        transform: `rotate(-90 ${cx} ${cy})`,
        class: 'donut-slice',
      });

      inner.appendChild(slice);
      g.appendChild(inner);
      svg.appendChild(g);

      const actualBRL = (d.value / totalPct) * totalBRL;
      groups.push({
        g, inner, slice, midAngle, actualBRL,
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

    /* ---------- Destaque por hover (sem clique) ---------- */
    function highlight(i) {
      groups.forEach((grp, idx) => {
        const isActive = idx === i;
        const dimmed = i !== -1 && !isActive;
        if (isActive) {
          const dx = Math.cos(grp.midAngle) * 9;
          const dy = Math.sin(grp.midAngle) * 9;
          grp.inner.style.transform = `translate(${dx}px, ${dy}px)`;
          grp.inner.style.opacity = '1';
          grp.slice.setAttribute('stroke-width', String(stroke + 2));
        } else {
          grp.inner.style.transform = 'translate(0, 0)';
          grp.inner.style.opacity = dimmed ? '0.35' : '1';
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
      grp.g.addEventListener('mouseenter', () => highlight(i));
      grp.g.addEventListener('mouseleave', () => highlight(-1));
    });

    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    groups.forEach((grp, i) => {
      const item = document.createElement('span');
      item.innerHTML = `<i style="background:var(${data[i].color})"></i>${grp.label}<b>${grp.pct}%</b>`;
      item.addEventListener('mouseenter', () => highlight(i));
      item.addEventListener('mouseleave', () => highlight(-1));
      legend.appendChild(item);
    });
    host.appendChild(legend);
  }

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
        if (pinnedIdx === idx) hideTooltip();
        else {
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

  function renderMargens() {
    if (!elMargemList) return;
    const produtos = getProdutos();

    const grupos = { hw: [], sw: [], sv: [] };
    produtos.forEach(p => grupos[p.tipo].push(p));

    const linhas = Object.entries(grupos).map(([tipo, itens]) => {
      const receita = itens.reduce((s, p) => s + p.receita, 0);
      const lucro   = itens.reduce((s, p) => s + p.lucro, 0);
      const margem  = receita > 0 ? (lucro / receita) * 100 : 0;
      return { tipo, receita, lucro, margem };
    });

    elMargemList.innerHTML = linhas.map(l => {
      const info = TIPO_INFO[l.tipo];
      return `
        <div class="margin-item">
          <div class="margin-head">
            <span class="margin-label">${info.nome}</span>
            <span class="margin-value">${l.margem.toFixed(1).replace('.', ',')}%<small>${Dash.formatMoney(l.lucro)}</small></span>
          </div>
          <div class="margin-track">
            <div class="margin-fill ${info.tone}" style="width:0%" data-w="${l.margem}"></div>
          </div>
        </div>
      `;
    }).join('');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elMargemList.querySelectorAll('.margin-fill').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      });
    });
  }

  function renderTable() {
    if (!elTableHost) return;
    const produtos = [...getProdutos()].sort((a, b) => b.lucro - a.lucro);

    const head = `
      <div class="profit-row profit-head">
        <span>Produto / Serviço</span>
        <span>Tipo</span>
        <span class="num">Receita</span>
        <span class="num">Lucro</span>
        <span class="num pct">Margem</span>
      </div>
    `;

    const rows = produtos.map(p => {
      const info = TIPO_INFO[p.tipo];
      return `
        <div class="profit-row">
          <span class="profit-name">
            <span class="profit-dot" style="background:${info.cor}"></span>
            ${p.name}
          </span>
          <span><span class="profit-badge ${info.classe}">${info.nome}</span></span>
          <span class="num">${Dash.formatMoney(p.receita)}</span>
          <span class="num positive">${Dash.formatMoney(p.lucro)}</span>
          <span class="num pct">${p.margem.toFixed(1).replace('.', ',')}%</span>
        </div>
      `;
    }).join('');

    elTableHost.innerHTML = head + rows;
  }

  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();

    const d = getDataset();
    if (!d) return;
    const receitaTotal = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const custosTotal  = d.custos.reduce((s, v) => s + v, 0) * 1000;
    const lucroTotal   = receitaTotal - custosTotal;

    Chart.render();

    const produtos = getProdutos();
    const mixMap = { hw: 0, sw: 0, sv: 0 };
    produtos.forEach(p => { mixMap[p.tipo] += p.receita; });
    const mixData = [
      { label: 'Software',  value: mixMap.sw, color: '--chart-2' },
      { label: 'Hardware',  value: mixMap.hw, color: '--chart-1' },
      { label: 'Serviços',  value: mixMap.sv, color: '--chart-3' },
    ];
    Donut(elDonutMix, mixData, receitaTotal);

    const custosData = CUSTOS_MIX.map(c => ({
      label: c.label,
      value: Math.round(c.pct * 100),
      color: c.color,
    }));
    Donut(elDonutCustos, custosData, custosTotal);

    const origemData = ORIGEM_MIX.map(o => ({
      label: o.label,
      value: Math.round(o.pct * 100),
      color: o.color,
    }));
    Donut(elDonutOrigem, origemData, lucroTotal);

    Bars(elBarHost, aggregateLucro(d.lucro));

    renderMargens();
    renderTable();

    // Gera o resumo após as animações
    setTimeout(() => window.Insights?.render('lucros'), 450);
  }

  Dash.registrarView('lucros', { onShow: renderAll });
  if (Dash.getView() === 'lucros') requestAnimationFrame(renderAll);

  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'lucros') {
      renderAll();
    }
  });
})();