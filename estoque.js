/* ==========================================================================
   estoque.js — View "Estoque"
   Deriva estoque e movimentação do MESMO dataset da Visão Geral.
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[estoque] window.Dash não existe. Verifique a ordem dos scripts.');
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

  const viewHost = $('.view[data-view="estoque"]');
  if (!viewHost) return;

  const elCardSkus      = $('#estoqueCardSkus');
  const elCardValor     = $('#estoqueCardValor');
  const elCardGiro      = $('#estoqueCardGiro');
  const elCardCobertura = $('#estoqueCardCobertura');
  const elSkusVal       = $('#estoqueSkusValor');
  const elValorVal      = $('#estoqueValorValor');
  const elGiroVal       = $('#estoqueGiroValor');
  const elCoberturaVal  = $('#estoqueCoberturaValor');
  const elChartHost     = $('#chartEstoque');
  const elAbcHost       = $('#abcEstoque');
  const elArmazemList   = $('#armazemEstoque');
  const elCategoriaList = $('#categoriaEstoque');
  const elTableHost     = $('#tabelaEstoque');
  const elFiliaisLbl    = $('#filiaisLabelEstoque');

  /* ===== SKUs BASE (snapshot do inventário) ===== */
  const SKUS = [
    { code: 'HW-NB-015',   name: 'Notebook Pro 15',     cat: 'Notebooks',    qty: 28, min: 12, unit: 5800 },
    { code: 'HW-MN-027',   name: 'Monitor 27"',         cat: 'Monitores',    qty: 42, min: 18, unit: 1650 },
    { code: 'HW-SSD-1T',   name: 'SSD Externo 1TB',     cat: 'Armazenam.',   qty: 30, min: 15, unit: 620  },
    { code: 'HW-KB-MEC',   name: 'Teclado Mecânico',    cat: 'Periféricos',  qty: 75, min: 30, unit: 280  },
    { code: 'HW-WC-HD',    name: 'Webcam Full HD',      cat: 'Periféricos',  qty: 45, min: 20, unit: 340  },
    { code: 'HW-CH-ERG',   name: 'Cadeira Ergonômica',  cat: 'Mobiliário',   qty: 10, min: 8,  unit: 1450 },
    { code: 'HW-DK-USBC',  name: 'Docking Station',     cat: 'Periféricos',  qty: 12, min: 15, unit: 480  },
    { code: 'HW-HS-BT',    name: 'Headset Bluetooth',   cat: 'Áudio',        qty: 14, min: 20, unit: 210  },
    { code: 'HW-MG-DGT',   name: 'Mesa Digitalizadora', cat: 'Periféricos',  qty: 3,  min: 10, unit: 780  },
    { code: 'HW-MS-ERG',   name: 'Mouse Ergo',          cat: 'Periféricos',  qty: 6,  min: 25, unit: 130  },
  ];

  /* ===== MOVIMENTAÇÃO POR PERÍODO ===== */
  const MOV = {
    '30d': {
      labels: ['S1', 'S2', 'S3', 'S4'],
      entradas: [24, 30, 26, 32],
      saidas:   [22, 28, 24, 30],
      dias: 30,
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      entradas: [24, 30, 26, 32, 28, 31, 28, 33, 30, 34, 31, 36],
      saidas:   [22, 28, 24, 30, 26, 29, 27, 31, 28, 32, 30, 34],
      dias: 90,
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      entradas: [85, 105, 95, 115, 100, 108, 98, 120, 108, 122, 112, 128],
      saidas:   [80, 95, 88, 105, 95, 100, 92, 112, 100, 115, 105, 120],
      dias: 365,
    },
  };

  /* Variações fictícias para os badges */
  const VARIACOES = {
    '30d': { skus: 0.0, valor: 1.2, giro: 5.1, cobertura: -3.2 },
    '90d': { skus: 0.0, valor: 2.4, giro: 7.8, cobertura: -4.5 },
    '1a':  { skus: 0.0, valor: 2.3, giro: 8.4, cobertura: -5.1 },
  };

  /* Classes ABC por faixas (curva cumulativa) */
  const ABC_A = 0.80;
  const ABC_B = 0.95;

  /* ===== UTILS ===== */
  function pesoFiliais() {
    const sel = Dash.getSelectedBranches();
    return sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0) || 1;
  }

  function statusOf(qty, min) {
    if (qty < min * 0.5) return 'crit';
    if (qty < min) return 'low';
    return 'ok';
  }

  function statusLabel(s) {
    return s === 'crit' ? 'Crítico' : s === 'low' ? 'Nível baixo' : 'Em estoque';
  }

  /* ===== SKUs FILTRADOS ===== */
  function getSkus() {
    const peso = pesoFiliais();
    return SKUS.map(s => {
      const qty = Math.max(0, Math.round(s.qty * peso));
      const min = Math.max(1, Math.round(s.min * peso));
      const unit = s.unit;
      const total = qty * unit;
      const status = statusOf(qty, min);
      return { ...s, qty, min, unit, total, status };
    });
  }

  function getTotais() {
    const skus = getSkus();
    const skusAtivos = skus.length;
    const valorTotal = skus.reduce((s, k) => s + k.total, 0);

    const p = Dash.getPeriod();
    const mov = MOV[p] || MOV['1a'];
    const peso = pesoFiliais();

    const saidasPeriodo = mov.saidas.reduce((s, v) => s + v, 0) * peso;
    const estoqueMedio = skus.reduce((s, k) => s + k.qty, 0) / 2;
    const saidaDiaria = saidasPeriodo / mov.dias;

    const giro = estoqueMedio > 0 ? (saidasPeriodo / (mov.dias / 365)) / Math.max(estoqueMedio, 1) / 10 : 0;
    // Ajuste para ficar realista em torno de 4-5x/ano
    const giroAjustado = Math.max(0.5, Math.min(20, giro * 4.2 / Math.max(1, peso)));

    const cobertura = saidaDiaria > 0 ? (skus.reduce((s, k) => s + k.qty, 0) / saidaDiaria) : 0;

    return {
      skusAtivos,
      valorTotal,
      giro: giroAjustado,
      cobertura,
    };
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

    if (elSkusVal)      Dash.animateNumber(elSkusVal, t.skusAtivos);
    if (elValorVal)     Dash.animateMoney(elValorVal, t.valorTotal);
    if (elGiroVal)      Dash.animateNumber(elGiroVal, t.giro, { decimals: 1 });
    if (elCoberturaVal) Dash.animateNumber(elCoberturaVal, Math.round(t.cobertura));

    atualizarBadge(elCardSkus,      v.skus,      false);
    atualizarBadge(elCardValor,     v.valor,     false);
    atualizarBadge(elCardGiro,      v.giro,      false);
    atualizarBadge(elCardCobertura, v.cobertura, true);
  }

  /* ===== GRÁFICO DIVERGENTE ===== */
  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const p = Dash.getPeriod();
      const mov = MOV[p] || MOV['1a'];
      const peso = pesoFiliais();

      const labels   = mov.labels;
      const entradas = mov.entradas.map(v => Math.round(v * peso));
      const saidas   = mov.saidas.map(v => Math.round(v * peso));

      const n = labels.length;
      const padL = 8, padR = 8;
      const innerW = 100 - padL - padR;
      const step = innerW / n;
      const bw = step * 0.42;

      const eixoY = 52;
      const hMax = 40;
      const maxV = Math.max(...entradas, ...saidas) * 1.1;

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      // grid horizontal
      const grid = svgEl('g', {
        stroke: 'var(--chart-grid)',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      });
      [16, 28, 40, 64, 76, 88].forEach(y => {
        grid.appendChild(svgEl('line', { x1: padL, y1: y, x2: 100 - padR, y2: y }));
      });
      svg.appendChild(grid);

      // eixo zero destacado
      svg.appendChild(svgEl('line', {
        x1: padL, y1: eixoY,
        x2: 100 - padR, y2: eixoY,
        stroke: 'var(--line-2)',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      }));

      // barras
      const bars = [];

      labels.forEach((_, i) => {
        const x = padL + i * step + (step - bw) / 2;
        const hE = (entradas[i] / maxV) * hMax;
        const hS = (saidas[i] / maxV) * hMax;

        const barE = svgEl('rect', {
          x, y: eixoY - hE, width: bw, height: hE, rx: 2,
          fill: 'var(--chart-2)',
          opacity: '.95',
        });
        const barS = svgEl('rect', {
          x, y: eixoY, width: bw, height: hS, rx: 2,
          fill: 'var(--chart-1)',
          opacity: '.95',
        });

        barE.style.transformOrigin = `${x + bw / 2}px ${eixoY}px`;
        barS.style.transformOrigin = `${x + bw / 2}px ${eixoY}px`;
        barE.style.transform = 'scaleY(0)';
        barS.style.transform = 'scaleY(0)';
        barE.style.transition = `transform .7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`;
        barS.style.transition = `transform .7s cubic-bezier(.16,1,.3,1) ${i * 0.04 + 0.05}s`;

        svg.appendChild(barE);
        svg.appendChild(barS);

        bars.push({ x: padL + i * step, w: step, i });
      });

      wrap.appendChild(svg);

      // labels
      const labelsEl = document.createElement('div');
      labelsEl.className = 'chart-labels';
      const mostrarTodas = labels.length <= 8;
      const stepL = mostrarTodas ? 1 : Math.ceil(labels.length / 8);
      const ultimo = labels.length - 1;
      labels.forEach((lb, i) => {
        if (!mostrarTodas && i % stepL !== 0 && i !== ultimo) return;
        const s = document.createElement('span');
        s.textContent = lb;
        s.style.left = ((i + 0.5) / n) * 100 + '%';
        labelsEl.appendChild(s);
      });
      wrap.appendChild(labelsEl);

      // hover
      const hoverLayer = document.createElement('div');
      hoverLayer.className = 'chart-hover';
      wrap.appendChild(hoverLayer);

      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      wrap.appendChild(tooltip);

      chartData = { bars, entradas, saidas, labels, n, eixoY, hMax, maxV };

      function showAt(i, clientX) {
        const { bars, entradas, saidas, labels, eixoY, hMax, maxV, n } = chartData;
        const rect = wrap.getBoundingClientRect();
        const padL = 8, padR = 8;
        const innerW = rect.width - padL - padR;
        const centerX = ((i + 0.5) / n) * innerW + padL;

        const label = labels[i];
        const p = Dash.getPeriod();
        const prefix = p === '1a' ? 'Mês' : p === '90d' ? 'Semana' : 'Semana';

        tooltip.innerHTML = `
          <div class="tt-label">${prefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Entradas</span>
            <span class="tt-val">${entradas[i]} un.</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Saídas</span>
            <span class="tt-val">${saidas[i]} un.</span>
          </div>
          <div class="tt-row" style="border-top:1px solid var(--line);padding-top:4px;margin-top:4px">
            <span>Saldo</span>
            <span class="tt-val" style="color:${entradas[i] >= saidas[i] ? 'var(--pos)' : 'var(--neg)'}">${entradas[i] - saidas[i] > 0 ? '+' : ''}${entradas[i] - saidas[i]} un.</span>
          </div>
        `;

        const padTopPercent = 16;
        const topPos = padTopPercent;

        tooltip.style.left = ((centerX / rect.width) * 100) + '%';
        tooltip.style.top = topPos + '%';
        tooltip.classList.add('is-visible');
        hoverLayer.classList.add('is-active');
      }

      function hide() {
        tooltip.classList.remove('is-visible');
        hoverLayer.classList.remove('is-active');
      }

      let pinned = false;
      hoverLayer.addEventListener('mousemove', e => {
        if (pinned) return;
        const rect = wrap.getBoundingClientRect();
        const padL = 8, padR = 8;
        const innerW = rect.width - padL - padR;
        const x = e.clientX - rect.left - padL;
        const ratio = Math.max(0, Math.min(1, x / innerW));
        const idx = Math.min(n - 1, Math.floor(ratio * n));
        showAt(idx, e.clientX);
      });
      hoverLayer.addEventListener('mouseleave', () => { if (!pinned) hide(); });
      hoverLayer.addEventListener('click', e => {
        e.stopPropagation();
        if (pinned) { pinned = false; hide(); }
        else {
          const rect = wrap.getBoundingClientRect();
          const padL = 8, padR = 8;
          const innerW = rect.width - padL - padR;
          const x = e.clientX - rect.left - padL;
          const ratio = Math.max(0, Math.min(1, x / innerW));
          const idx = Math.min(n - 1, Math.floor(ratio * n));
          showAt(idx, e.clientX);
          pinned = true;
        }
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrap.classList.add('is-ready');
          svg.querySelectorAll('rect').forEach(bar => {
            bar.style.transform = 'scaleY(1)';
          });
        });
      });

      return wrap;
    }

    function render() {
      elChartHost.innerHTML = '';
      elChartHost.appendChild(build());
    }

    return { render };
  })();

  /* ===== CURVA ABC ===== */
  function renderAbc() {
    if (!elAbcHost) return;
    const skus = [...getSkus()].sort((a, b) => b.total - a.total);
    const total = skus.reduce((s, k) => s + k.total, 0) || 1;

    let acc = 0;
    const classes = { A: { valor: 0, skus: 0 }, B: { valor: 0, skus: 0 }, C: { valor: 0, skus: 0 } };

    skus.forEach(k => {
      const pctAccAntes = acc / total;
      acc += k.total;
      const pctAccDepois = acc / total;

      let cls;
      if (pctAccAntes < ABC_A) cls = 'A';
      else if (pctAccAntes < ABC_B) cls = 'B';
      else cls = 'C';

      // Ajuste: se cruzar a faixa, coloca na faixa que começou
      if (pctAccAntes < ABC_A && pctAccDepois > ABC_A && pctAccDepois - ABC_A > ABC_A - pctAccAntes) {
        // deixa em A por simplicidade, maioria dos casos
      }

      classes[cls].valor += k.total;
      classes[cls].skus += 1;
    });

    const pctA = (classes.A.valor / total) * 100;
    const pctB = (classes.B.valor / total) * 100;
    const pctC = (classes.C.valor / total) * 100;

    elAbcHost.innerHTML = `
      <div class="abc-stack">
        <div class="abc-segment abc-a" style="width:${pctA}%" title="Classe A · ${pctA.toFixed(1)}%"></div>
        <div class="abc-segment abc-b" style="width:${pctB}%" title="Classe B · ${pctB.toFixed(1)}%"></div>
        <div class="abc-segment abc-c" style="width:${pctC}%" title="Classe C · ${pctC.toFixed(1)}%"></div>
      </div>
      <div class="abc-legend">
        <div class="abc-leg-item">
          <span class="abc-leg-dot abc-a"></span>
          <span class="abc-leg-name">Classe A</span>
          <strong>${pctA.toFixed(1).replace('.', ',')}%</strong>
          <small>${classes.A.skus} SKU${classes.A.skus !== 1 ? 's' : ''}</small>
        </div>
        <div class="abc-leg-item">
          <span class="abc-leg-dot abc-b"></span>
          <span class="abc-leg-name">Classe B</span>
          <strong>${pctB.toFixed(1).replace('.', ',')}%</strong>
          <small>${classes.B.skus} SKU${classes.B.skus !== 1 ? 's' : ''}</small>
        </div>
        <div class="abc-leg-item">
          <span class="abc-leg-dot abc-c"></span>
          <span class="abc-leg-name">Classe C</span>
          <strong>${pctC.toFixed(1).replace('.', ',')}%</strong>
          <small>${classes.C.skus} SKU${classes.C.skus !== 1 ? 's' : ''}</small>
        </div>
      </div>
    `;
  }

  /* ===== ESTOQUE POR ARMAZÉM ===== */
  function renderArmazens() {
    if (!elArmazemList) return;
    const skus = getSkus();
    const total = skus.reduce((s, k) => s + k.total, 0);

    const sel = Dash.getSelectedBranches();
    const pesoTotal = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0) || 1;

    const linhas = sel.map(k => {
      const info = Dash.FILIAIS[k];
      const peso = (info.pesoReceita || 0) / pesoTotal;
      const valor = total * peso;
      return { nome: info.nome, peso, valor };
    }).sort((a, b) => b.valor - a.valor);

    const maxVal = Math.max(...linhas.map(l => l.valor), 1);

    elArmazemList.innerHTML = linhas.map(l => `
      <div class="margin-item">
        <div class="margin-head">
          <span class="margin-label">${l.nome}</span>
          <span class="margin-value">${Dash.formatMoney(l.valor)}<small>${Math.round(l.peso * 100)}%</small></span>
        </div>
        <div class="margin-track">
          <div class="margin-fill" style="width:0%" data-w="${(l.valor / maxVal) * 100}"></div>
        </div>
      </div>
    `).join('');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elArmazemList.querySelectorAll('.margin-fill').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      });
    });
  }

  /* ===== STATUS POR CATEGORIA ===== */
  function renderCategorias() {
    if (!elCategoriaList) return;
    const skus = getSkus();

    // agrupa por categoria
    const map = {};
    skus.forEach(k => {
      if (!map[k.cat]) map[k.cat] = { qty: 0, min: 0, valor: 0, itens: 0 };
      map[k.cat].qty   += k.qty;
      map[k.cat].min   += k.min;
      map[k.cat].valor += k.total;
      map[k.cat].itens += 1;
    });

    const linhas = Object.entries(map).map(([cat, d]) => {
      const ocupacao = d.min > 0 ? Math.min(200, (d.qty / d.min) * 100) : 100;
      const status = ocupacao < 50 ? 'crit' : ocupacao < 100 ? 'low' : 'ok';
      return { cat, ...d, ocupacao, status };
    }).sort((a, b) => b.valor - a.valor);

    elCategoriaList.innerHTML = linhas.map(l => `
      <div class="margin-item">
        <div class="margin-head">
          <span class="margin-label">${l.cat}</span>
          <span class="margin-value" style="color:${l.status === 'crit' ? 'var(--neg)' : l.status === 'low' ? 'var(--warn)' : 'var(--fg)'}">
            ${Math.round(l.ocupacao)}%<small>${l.itens} SKU${l.itens !== 1 ? 's' : ''}</small>
          </span>
        </div>
        <div class="margin-track">
          <div class="margin-fill" style="width:0%;background:${
            l.status === 'crit' ? 'linear-gradient(90deg,var(--neg),#fb7185)' :
            l.status === 'low'  ? 'linear-gradient(90deg,var(--warn),#fbbf24)' :
                                  'linear-gradient(90deg,var(--accent),var(--accent-2))'
          }" data-w="${Math.min(100, l.ocupacao)}"></div>
        </div>
      </div>
    `).join('');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elCategoriaList.querySelectorAll('.margin-fill').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      });
    });
  }

  /* ===== TABELA DE SKUs ===== */
  function renderTable() {
    if (!elTableHost) return;
    const skus = [...getSkus()].sort((a, b) => b.total - a.total);

    const head = `
      <div class="sku-row sku-head">
        <span>SKU</span>
        <span>Produto</span>
        <span>Categoria</span>
        <span class="num">Qtd</span>
        <span class="num">Valor unit.</span>
        <span class="num">Total</span>
        <span>Status</span>
      </div>
    `;

    const rows = skus.map(k => `
      <div class="sku-row">
        <span class="sku-code">${k.code}</span>
        <span class="sku-name">${k.name}</span>
        <span class="sku-cat">${k.cat}</span>
        <span class="num qty">${k.qty}</span>
        <span class="num">${Dash.formatMoney(k.unit)}</span>
        <span class="num total">${Dash.formatMoney(k.total)}</span>
        <span class="status-pill status-pill--${k.status}">${statusLabel(k.status)}</span>
      </div>
    `).join('');

    elTableHost.innerHTML = head + rows;
  }

  /* ===== RENDER GERAL ===== */
  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();
    Chart.render();
    renderAbc();
    renderArmazens();
    renderCategorias();
    renderTable();
  }

  /* ===== REGISTRO NA SPA ===== */
  Dash.registrarView('estoque', { onShow: renderAll });

  if (Dash.getView() === 'estoque') {
    requestAnimationFrame(renderAll);
  }

  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'estoque') renderAll();
  });
})();