/* ==========================================================================
   demanda.js — View "Demanda"
   Deriva volumes do MESMO dataset da Visão Geral/Lucros.
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[demanda] window.Dash não existe. Verifique a ordem dos scripts.');
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

  const viewHost = $('.view[data-view="demanda"]');
  if (!viewHost) return;

  const elCardPedidos     = $('#demandaCardPedidos');
  const elCardAssinaturas = $('#demandaCardAssinaturas');
  const elCardConversao   = $('#demandaCardConversao');
  const elCardTicket      = $('#demandaCardTicket');
  const elPedidosVal      = $('#demandaPedidosValor');
  const elAssinaturasVal  = $('#demandaAssinaturasValor');
  const elConversaoVal    = $('#demandaConversaoValor');
  const elTicketVal       = $('#demandaTicketValor');
  const elChartHost       = $('#chartDemanda');
  const elDonutOrigem     = $('#donutOrigemDemanda');
  const elDonutTipo       = $('#donutTipoDemanda');
  const elBarHost         = $('#barCategoriaDemanda');
  const elListFiliais     = $('#demandaFiliais');
  const elTableHost       = $('#tabelaDemanda');
  const elFiliaisLbl      = $('#filiaisLabelDemanda');

  /* ===== PRODUTOS (mesmos do profits.js) =====
     ticket = valor médio por pedido (em R$)
     tipo   = hw | sw | sv
  */
  const PRODUTOS = [
    { name: 'Notebook Pro 15',     tipo: 'hw', share: 0.0775, ticket: 8500 },
    { name: 'Monitor 27"',         tipo: 'hw', share: 0.0581, ticket: 2400 },
    { name: 'Teclado Mecânico',    tipo: 'hw', share: 0.0472, ticket: 450  },
    { name: 'Headset Bluetooth',   tipo: 'hw', share: 0.0327, ticket: 320  },
    { name: 'Mouse Ergo',          tipo: 'hw', share: 0.0206, ticket: 180  },
    { name: 'Plano Enterprise',    tipo: 'sw', share: 0.2542, ticket: 1200 },
    { name: 'Plano Pro',           tipo: 'sw', share: 0.1598, ticket: 480  },
    { name: 'Plano Starter',       tipo: 'sw', share: 0.0871, ticket: 180  },
    { name: 'Add-on Analytics',    tipo: 'sw', share: 0.0581, ticket: 250  },
    { name: 'Add-on Suporte 24/7', tipo: 'sw', share: 0.0363, ticket: 90   },
    { name: 'Consultoria',         tipo: 'sv', share: 0.1090, ticket: 6500 },
    { name: 'Treinamento',         tipo: 'sv', share: 0.0594, ticket: 1200 },
  ];

  const TIPO_INFO = {
    hw: { nome: 'Hardware', cor: 'var(--accent-2)', classe: 'profit-badge--hw', tone: 'tone-hw' },
    sw: { nome: 'Software', cor: 'var(--pos)',      classe: 'profit-badge--sw', tone: 'tone-sw' },
    sv: { nome: 'Serviço',  cor: '#f472b6',         classe: 'profit-badge--sv', tone: 'tone-sv' },
  };

  /* Distribuição de origem (fixa) */
  const ORIGEM_MIX = [
    { label: 'Inbound',      pct: 0.42, color: '--chart-1' },
    { label: 'Indicação',    pct: 0.24, color: '--chart-2' },
    { label: 'Outbound',     pct: 0.21, color: '--chart-3' },
    { label: 'Mídia paga',   pct: 0.13, color: '--chart-4' },
  ];

  /* Tipo de demanda */
  const TIPO_DEMANDA = [
    { label: 'Renovação',     pct: 0.45, color: '--chart-2', classe: 'rn' },
    { label: 'Novo negócio',  pct: 0.32, color: '--chart-1', classe: 'nv' },
    { label: 'Upsell',        pct: 0.23, color: '--chart-3', classe: 'up' },
  ];

  /* Filiais — mesma proporção da receita */
  const FILIAL_WEIGHTS = {
    campinas: 0.42,
    jundiai:  0.31,
    saopaulo: 0.27,
  };

  /* Ticket médio de referência (R$ por pedido) — constante */
  const TICKET_MEDIO = 472;

  /* Variações por período (fictícias, apenas para os badges) */
  const VARIACOES = {
    '30d': { pedidos: 5.2, assinaturas: 9.1, conversao: 0.3, ticket: 1.4 },
    '90d': { pedidos: 8.1, assinaturas: 11.6, conversao: 0.6, ticket: 2.1 },
    '1a':  { pedidos: 6.4, assinaturas: 12.4, conversao: 0.4, ticket: 2.8 },
  };

  /* ===== FONTE DE DADOS ===== */
  function getDataset() {
    const d = Dash.getDataset();
    if (!d) return null;

    // Receita em R$ (array) — já filtrada por filial + período
    const receitaR = d.receita.map(v => v * 1000);

    // Pedidos por label — receita / ticket médio
    const pedidos = receitaR.map(r => Math.round(r / TICKET_MEDIO));

    // Meta = média dos pedidos × 1.02 (linha quase reta, sutil acima)
    const media = pedidos.reduce((s, v) => s + v, 0) / pedidos.length;
    const meta = pedidos.map(() => Math.round(media * 1.02));

    return {
      labels: d.labels,
      receitaR,
      pedidos,
      meta,
    };
  }

  function getProdutos() {
    const d = getDataset();
    if (!d) return [];
    const receitaTotal = d.receitaR.reduce((s, v) => s + v, 0);

    return PRODUTOS.map(p => {
      const receita = receitaTotal * p.share;
      const units   = Math.max(1, Math.round(receita / p.ticket));
      const lucro   = receita * 0.55; // margem fictícia coerente
      return {
        name: p.name,
        tipo: p.tipo,
        ticket: p.ticket,
        units,
        receita,
        lucro,
      };
    });
  }

  function aggregateByTipo(produtos) {
    const acc = { hw: 0, sw: 0, sv: 0 };
    produtos.forEach(p => { acc[p.tipo] += p.units; });
    return acc;
  }

  function getTotais() {
    const produtos = getProdutos();
    const pedidos = produtos.reduce((s, p) => s + p.units, 0);
    const receita = produtos.reduce((s, p) => s + p.receita, 0);
    const assinaturas = Math.round(
      produtos.filter(p => p.tipo === 'sw').reduce((s, p) => s + p.units, 0) * 0.27
    );
    const ticket = pedidos > 0 ? receita / pedidos : 0;
    const conversao = 4.2; // fixa, vem dos leads fictícios

    return { pedidos, assinaturas, ticket, conversao };
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
  function atualizarBadge(card, variacao, invertido = false) {
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

  /* ===== CARDS ===== */
  function renderCards() {
    const t = getTotais();
    const p = Dash.getPeriod();
    const v = VARIACOES[p] || VARIACOES['1a'];

    if (elPedidosVal)     Dash.animateNumber(elPedidosVal, t.pedidos);
    if (elAssinaturasVal) Dash.animateNumber(elAssinaturasVal, t.assinaturas);
    if (elConversaoVal)   Dash.animateNumber(elConversaoVal, t.conversao, { decimals: 1 });
    if (elTicketVal)      Dash.animateMoney(elTicketVal, t.ticket);

    atualizarBadge(elCardPedidos,     v.pedidos,     false);
    atualizarBadge(elCardAssinaturas, v.assinaturas, false);
    atualizarBadge(elCardConversao,   v.conversao,   false);
    atualizarBadge(elCardTicket,      v.ticket,      false);
  }

  /* ===== GRÁFICO ===== */
  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const data = getDataset();
      if (!data) return document.createElement('div');

      const { pedidos, meta, labels } = data;
      const max = Math.max(...pedidos, ...meta) * 1.12;
      const n = pedidos.length;
      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => (1 - v / max) * 100;

      const ptsP = pedidos.map((v, i) => [xAt(i), yAt(v)]);
      const ptsM = meta.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gDemandArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-2)', 'stop-opacity': '.30' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-2)', 'stop-opacity': '0' }));
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

      const areaD = smoothPath(ptsP) + ` L 100 100 L 0 100 Z`;
      const area = svgEl('path', { d: areaD, fill: 'url(#gDemandArea)', opacity: '0' });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      // Meta (linha pontilhada)
      const metaLine = svgEl('path', {
        d: smoothPath(ptsM),
        fill: 'none',
        stroke: 'var(--chart-1)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-dasharray': '5 5',
        'vector-effect': 'non-scaling-stroke',
        'opacity': '.65',
      });
      svg.appendChild(metaLine);

      // Pedidos (linha sólida)
      const line = svgEl('path', {
        d: smoothPath(ptsP),
        fill: 'none',
        stroke: 'var(--chart-2)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      });
      svg.appendChild(line);

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points';
      ptsP.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top  = p[1] + '%';
        dot.style.background = 'var(--chart-2)';
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

      chartData = { ptsP, ptsM, labels, n, pedidos, meta };

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
        const pP = chartData.ptsP[idx];
        const label = chartData.labels[idx];
        const p = Dash.getPeriod();
        const prefix = p === '1a' ? 'Mês' : p === '90d' ? 'Semana' : 'Dia';

        cursor.style.left = pP[0] + '%';

        tooltip.innerHTML = `
          <div class="tt-label">${prefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Pedidos</span>
            <span class="tt-val">${chartData.pedidos[idx].toLocaleString('pt-BR')}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Meta</span>
            <span class="tt-val">${chartData.meta[idx].toLocaleString('pt-BR')}</span>
          </div>
        `;

        const rect = wrap.getBoundingClientRect();
        const padT = 16, padB = 28;
        const topY = Math.min(chartData.ptsP[idx][1], chartData.ptsM[idx][1]);
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pP[0] + '%';
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
    valueEl.textContent = totalBRL >= 1000 ? Math.round(totalBRL).toLocaleString('pt-BR') : totalBRL;
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
        valueEl.textContent = totalBRL >= 1000 ? Math.round(totalBRL).toLocaleString('pt-BR') : totalBRL;
      } else {
        labelEl.textContent = groups[i].label;
        valueEl.textContent = groups[i].pct + '%';
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
    const bw = step * 0.5;

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
    const gid = 'barG-demanda';
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
      bar.style.transition = `y .7s cubic-bezier(.16,1,.3,1) ${i * 0.06}s,` +
                             ` height .7s cubic-bezier(.16,1,.3,1) ${i * 0.06}s`;
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
      zone.dataset.value = d.value.toLocaleString('pt-BR') + ' pedidos';
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
        <div class="tt-val">${zone.dataset.value}</div>
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

  /* ===== LISTA DE FILIAIS ===== */
  function renderFiliais(produtos) {
    if (!elListFiliais) return;
    const total = produtos.reduce((s, p) => s + p.units, 0);

    const sel = Dash.getSelectedBranches();
    const pesoTotal = sel.reduce((s, k) => s + (FILIAL_WEIGHTS[k] || 0), 0) || 1;

    const linhas = sel.map(k => {
      const info = Dash.FILIAIS[k];
      const peso = (FILIAL_WEIGHTS[k] || 0) / pesoTotal;
      const units = Math.round(total * peso);
      return { nome: info.nome, peso, units };
    }).sort((a, b) => b.units - a.units);

    const maxUnits = Math.max(...linhas.map(l => l.units), 1);

    elListFiliais.innerHTML = linhas.map(l => `
      <div class="margin-item">
        <div class="margin-head">
          <span class="margin-label">${l.nome}</span>
          <span class="margin-value">${l.units.toLocaleString('pt-BR')}<small>pedidos</small></span>
        </div>
        <div class="margin-track">
          <div class="margin-fill" style="width:0%" data-w="${(l.units / maxUnits) * 100}"></div>
        </div>
      </div>
    `).join('');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elListFiliais.querySelectorAll('.margin-fill').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      });
    });
  }

  /* ===== TABELA ===== */
  function renderTable() {
    if (!elTableHost) return;
    const produtos = [...getProdutos()].sort((a, b) => b.units - a.units);

    const head = `
      <div class="profit-row profit-head">
        <span>Produto / Serviço</span>
        <span>Tipo</span>
        <span class="num">Pedidos</span>
        <span class="num">Ticket</span>
        <span class="num pct">Receita</span>
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
          <span class="num">${p.units.toLocaleString('pt-BR')}</span>
          <span class="num">${Dash.formatMoney(p.ticket)}</span>
          <span class="num pct">${Dash.formatMoney(p.receita)}</span>
        </div>
      `;
    }).join('');

    elTableHost.innerHTML = head + rows;
  }

  /* ===== RENDER ===== */
  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();

    const d = getDataset();
    if (!d) return;

    const produtos = getProdutos();
    const totalPedidos = produtos.reduce((s, p) => s + p.units, 0);

    Chart.render();

    // Donut · Origem dos pedidos
    const origemData = ORIGEM_MIX.map(o => ({
      label: o.label,
      value: Math.round(o.pct * 100),
      color: o.color,
    }));
    Donut(elDonutOrigem, origemData, totalPedidos);

    // Donut · Tipo de demanda
    const tipoData = TIPO_DEMANDA.map(t => ({
      label: t.label,
      value: Math.round(t.pct * 100),
      color: t.color,
    }));
    Donut(elDonutTipo, tipoData, totalPedidos);

    // Barras · Pedidos por categoria
    const byTipo = aggregateByTipo(produtos);
    Bars(elBarHost, [
      { label: 'Software', value: byTipo.sw },
      { label: 'Hardware', value: byTipo.hw },
      { label: 'Serviços', value: byTipo.sv },
    ]);

    renderFiliais(produtos);
    renderTable();
  }

  /* ===== REGISTRO NA SPA ===== */
  Dash.registrarView('demanda', { onShow: renderAll });

  if (Dash.getView() === 'demanda') {
    requestAnimationFrame(renderAll);
  }

  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'demanda') renderAll();
  });
})();