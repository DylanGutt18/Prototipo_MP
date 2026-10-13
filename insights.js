/* ==========================================================================
   insights.js — Gera resumos analíticos em texto a partir dos dados
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);

  /* ---------- Helpers de formatação ---------- */
  const pct = (n, dec = 1) =>
    `${Number(n).toFixed(dec).replace('.', ',')}%`;

  const num = (n, dec = 0) =>
    Number(n).toLocaleString('pt-BR', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });

  const delta = (n) => {
    const sinal = n > 0 ? '+' : '';
    return `${sinal}${Number(n).toFixed(1).replace('.', ',')}%`;
  };

  const toneDelta = (n, inverted = false) => {
    if (n === 0) return '';
    const bom = inverted ? n < 0 : n > 0;
    return bom ? 'pos' : 'neg';
  };

  const kpi = (text, tone = '') =>
    `<span class="kpi-inline ${tone}">${text}</span>`;

  const strong = (t) => `<strong>${t}</strong>`;

  /**
   * Devolve um texto natural para a variação.
   *   variacao(+6.2)  → "subiu 6,2%"
   *   variacao(-2.1)  → "caiu 2,1%"
   *   variacao(0)     → "ficou estável"
   *
   * Opções:
   *   verboPos / verboNeg — personalizam o verbo
   *   valorPuro           — retorna só "6,2%" / "2,1%" (sem verbo)
   */
  const variacao = (n, opts = {}) => {
    const abs = Math.abs(Number(n)).toFixed(1).replace('.', ',') + '%';
    if (Number(n) === 0) return 'ficou estável';
    const positivo = Number(n) > 0;
    const verboPadrao = positivo ? 'subiu' : 'caiu';
    const verbo = positivo
      ? (opts.verboPos || verboPadrao)
      : (opts.verboNeg || verboPadrao);
    return `${verbo} ${abs}`;
  };

  const safeNum = (v, fallback = 0) => {
    const n = parseFloat(v);
    return isFinite(n) ? n : fallback;
  };

  /* ---------- Templates por view ---------- */
  const BUILDERS = {};

  /* ============================================================
     VISÃO GERAL
     ============================================================ */
  BUILDERS.geral = () => {
    const Dash = window.Dash;
    if (!Dash) return '';
    const d = Dash.getDataset();
    if (!d) return '';

    const receita = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const despesa = d.despesa.reduce((s, v) => s + v, 0) * 1000;
    const lucro = receita - despesa;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;

    const maxReceita = Math.max(...d.receita);
    const maxIdx = d.receita.indexOf(maxReceita);
    const picoLabel = d.labels[maxIdx];

    const minReceita = Math.min(...d.receita);
    const minIdx = d.receita.indexOf(minReceita);
    const valeLabel = d.labels[minIdx];

    const mediaReceitaMil = (receita / d.receita.length) / 1000;
    const ultimo = d.receita[d.receita.length - 1];
    const vsMedia = mediaReceitaMil > 0
      ? ((ultimo / mediaReceitaMil) - 1) * 100
      : 0;

    const catTop = [...d.categorias].sort((a, b) => b.value - a.value)[0];
    const origTop = [...d.origem].sort((a, b) => b.value - a.value)[0];

    /* ---------- Expande abreviações de mês para o texto do resumo ---------- */
    const MESES_ABREV = {
      'Jan': 'Janeiro', 'Fev': 'Fevereiro', 'Mar': 'Março',
      'Abr': 'Abril',   'Mai': 'Maio',      'Jun': 'Junho',
      'Jul': 'Julho',   'Ago': 'Agosto',    'Set': 'Setembro',
      'Out': 'Outubro', 'Nov': 'Novembro',  'Dez': 'Dezembro',
    };
    const nomeMes = (lb) => MESES_ABREV[lb] || lb;

    /* ---------- Detecta o período para dar contexto aos labels ---------- */
    const periodo = Dash.getPeriod();          // '30d' | '90d' | '1a'

    // Prefixo usado antes do número do label (já com "o/a" para uso em "no/na")
    const prefixo = periodo === '1a'  ? ''
                  : periodo === '90d' ? 'Semana '
                  :                     'Dia ';

    // Preposição correta para "ocorreu ___ <label>"
    const prep = periodo === '1a'  ? 'em'   // em Dezembro
               : periodo === '90d' ? 'na'   // na Semana 12
               :                     'no';  // no Dia 30

    // "unidade" = como chamar um ponto no texto
    //   Ex.: "O último mês", "A última semana", "O último dia"
    const unidade = periodo === '1a'  ? 'mês'
                  : periodo === '90d' ? 'semana'
                  :                     'dia';

    const artigo = (periodo === '1a') ? 'O último'
                 : (periodo === '90d') ? 'A última'
                 : 'O último';

    const rotulo = (lb) => {
      if (periodo === '1a') return nomeMes(lb);
      const num = String(lb).replace(/^S/i, '');
      return prefixo + num;
    };

    const frases = [];

    // Panorama geral
    const vReceita = variacao(d.variacaoReceita);
    const vDespesa = variacao(d.variacaoDespesa, { verboPos: 'subiu', verboNeg: 'caiu' });
    frases.push(
      `No período selecionado, a operação registrou ` +
      `${kpi(Dash.formatMoney(receita))} em receita ` +
      `e ${kpi(Dash.formatMoney(despesa))} em despesas, ` +
      `resultando em lucro de ${kpi(Dash.formatMoney(lucro), 'pos')} ` +
      `e margem líquida de ${kpi(pct(margem), margem >= 20 ? 'pos' : 'warn')}. ` +
      `A receita ${vReceita.split(' ')[0]} ` +
      `${kpi(vReceita.split(' ').slice(1).join(' '), toneDelta(d.variacaoReceita))} ` +
      `e a despesa ${vDespesa.split(' ')[0]} ` +
      `${kpi(vDespesa.split(' ').slice(1).join(' '), toneDelta(d.variacaoDespesa, true))} ` +
      `em relação ao período anterior.`
    );

    // Picos e vales
    const vMedia = vsMedia >= 0
      ? `ficou ${kpi('+' + vsMedia.toFixed(1).replace('.', ',') + '%', 'pos')} acima`
      : `ficou ${kpi(vsMedia.toFixed(1).replace('.', ',') + '%', 'neg')} abaixo`;

    frases.push(
      `O pico de receita ocorreu ${prep} ${strong(rotulo(picoLabel))} ` +
      `(${kpi(Dash.formatMoney(maxReceita * 1000))}), enquanto o menor ` +
      `volume foi registrado ${prep} ${strong(rotulo(valeLabel))} ` +
      `(${kpi(Dash.formatMoney(minReceita * 1000))}). ` +
      `${artigo} ${unidade} ${vMedia} da média do período.`
    );

    // Composições
    frases.push(
      `Nos gastos, a categoria com maior peso foi ${strong(catTop.label)}, ` +
      `representando ${kpi(pct(catTop.value, 0))} do total. ` +
      `Do lado da receita, ${strong(origTop.label)} ` +
      `responde por ${kpi(pct(origTop.value, 0))} da entrada.`
    );

    return frases.map(f => `<p>${f}</p>`).join('');
  };

  /* ============================================================
     LUCROS
     ============================================================ */
  BUILDERS.lucros = () => {
    const Dash = window.Dash;
    if (!Dash) return '';
    const d = Dash.getDataset();
    if (!d) return '';

    const receita = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const custos = d.despesa.reduce((s, v) => s + v, 0) * 1000;
    const lucro = receita - custos;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;

    const lucros = d.receita.map((r, i) => r - d.despesa[i]);
    const maxLucro = Math.max(...lucros);
    const maxIdx = lucros.indexOf(maxLucro);
    const melhorPeriodo = d.labels[maxIdx];

    const minLucro = Math.min(...lucros);
    const minIdx = lucros.indexOf(minLucro);
    const piorPeriodo = d.labels[minIdx];

    const mediaLucro = lucro / d.labels.length;

    const frases = [];

    frases.push(
      `A receita bruta no período foi de ${kpi(Dash.formatMoney(receita))} ` +
      `contra ${kpi(Dash.formatMoney(custos))} em custos totais, ` +
      `gerando lucro líquido de ${kpi(Dash.formatMoney(lucro), 'pos')} ` +
      `e margem de ${kpi(pct(margem), margem >= 20 ? 'pos' : 'warn')}.`
    );

    frases.push(
      `O ponto de maior rentabilidade foi em ${strong(melhorPeriodo)}, ` +
      `com lucro de ${kpi(Dash.formatMoney(maxLucro * 1000), 'pos')}, ` +
      `enquanto o pior resultado veio em ${strong(piorPeriodo)} ` +
      `(${kpi(Dash.formatMoney(minLucro * 1000))}). ` +
      `A média de lucro por período ficou em ${kpi(Dash.formatMoney(mediaLucro))}.`
    );

    // Leitura da margem
    let leitura;
    if (margem >= 25) {
      leitura = 'A margem está saudável e acima do benchmark típico de 20-25% para o setor.';
    } else if (margem >= 15) {
      leitura = 'A margem está dentro do aceitável, mas há espaço para otimização de custos.';
    } else {
      leitura = 'A margem está apertada — vale revisar os principais centros de custo.';
    }
    frases.push(strong('Leitura: ') + leitura);

    return frases.map(f => `<p>${f}</p>`).join('');
  };

  /* ============================================================
     DEMANDA
     ============================================================ */
  BUILDERS.demanda = () => {
    const Dash = window.Dash;
    if (!Dash) return '';

    const pedidos = safeNum($('#demandaPedidosValor')?.dataset.current);
    const assinaturas = safeNum($('#demandaAssinaturasValor')?.dataset.current);
    const conversao = safeNum($('#demandaConversaoValor')?.dataset.current);
    const ticket = safeNum($('#demandaTicketValor')?.dataset.current);

    if (!pedidos) return '';

    const shareAssin = pedidos > 0 ? (assinaturas / pedidos) * 100 : 0;
    const receitaEstimada = pedidos * ticket;

    const frases = [];

    frases.push(
      `A demanda total no período foi de ${kpi(num(pedidos))} pedidos, ` +
      `com ${kpi(num(assinaturas))} novas assinaturas ` +
      `e taxa de conversão de ${kpi(pct(conversao))}. ` +
      `O ticket médio ficou em ${kpi(Dash.formatMoney(ticket))}.`
    );

    frases.push(
      `As assinaturas representam ${kpi(pct(shareAssin))} do total de pedidos, ` +
      `o que indica ${shareAssin >= 20 ? 'um bom equilíbrio' : 'potencial de crescimento'} ` +
      `na base recorrente. Cada ponto percentual adicional de conversão ` +
      `representaria cerca de ${kpi(Dash.formatMoney((pedidos * 0.01) * ticket))} ` +
      `em receita incremental.`
    );

    return frases.map(f => `<p>${f}</p>`).join('');
  };

  /* ============================================================
     ESTOQUE
     ============================================================ */
  BUILDERS.estoque = () => {
    const Dash = window.Dash;
    if (!Dash) return '';

    const skus = safeNum($('#estoqueSkusValor')?.dataset.current);
    const valor = safeNum($('#estoqueValorValor')?.dataset.current);
    const giro = safeNum($('#estoqueGiroValor')?.dataset.current);
    const cobertura = safeNum($('#estoqueCoberturaValor')?.dataset.current);

    if (!skus && !valor) return '';

    const giroFmt = giro.toFixed(1).replace('.', ',') + 'x';

    const frases = [];

    frases.push(
      `O inventário atual conta com ${kpi(num(skus))} SKUs ativos, ` +
      `totalizando ${kpi(Dash.formatMoney(valor))} em capital imobilizado. ` +
      `O giro está em ${kpi(giroFmt)} ao ano ` +
      `e a cobertura atual é de ${kpi(cobertura + ' dias')}.`
    );

    // Leitura do giro
    let alertaGiro;
    if (giro < 4) {
      alertaGiro = 'O giro está abaixo do ideal — há capital parado que poderia ser liberado.';
    } else if (giro > 10) {
      alertaGiro = 'O giro está elevado, o que pode indicar risco de ruptura. Vale monitorar.';
    } else {
      alertaGiro = 'O giro está em uma faixa saudável.';
    }
    frases.push(strong('Giro: ') + alertaGiro);

    // Leitura da cobertura
    let alertaCob;
    if (cobertura < 30) {
      alertaCob = 'A cobertura é baixa — risco real de desabastecimento nos próximos dias.';
    } else if (cobertura > 120) {
      alertaCob = 'A cobertura é alta — capital em excesso no estoque.';
    } else {
      alertaCob = 'A cobertura está adequada para a operação atual.';
    }
    frases.push(strong('Cobertura: ') + alertaCob);

    return frases.map(f => `<p>${f}</p>`).join('');
  };

  /* ============================================================
     DESEMPENHO
     ============================================================ */
  BUILDERS.desempenho = () => {
    const Dash = window.Dash;
    if (!Dash) return '';

    const nps = safeNum($('#desempNpsValor')?.dataset.current);
    const sla = safeNum($('#desempSlaValor')?.dataset.current);
    const tempo = safeNum($('#desempTempoValor')?.dataset.current);
    const prod = safeNum($('#desempProdutividadeValor')?.dataset.current);

    if (!nps && !sla) return '';

    const score = Math.round((sla + nps + prod + (100 - tempo * 10)) / 4);
    const scoreTone = score >= 85 ? 'pos' : score >= 70 ? 'warn' : 'neg';

    const frases = [];

    frases.push(
      `O score geral da operação é ${kpi(score + '/100', scoreTone)}, ` +
      `calculado a partir de NPS ${kpi(num(nps))}, ` +
      `SLA de ${kpi(pct(sla))}, ` +
      `tempo médio de resposta de ${kpi(tempo.toFixed(1).replace('.', ',') + 'h')} ` +
      `e produtividade de ${kpi(pct(prod))}.`
    );

    let leituraNps;
    if (nps >= 75) leituraNps = 'O NPS está na zona de excelência.';
    else if (nps >= 50) leituraNps = 'O NPS está na zona de qualidade, com espaço para evoluir.';
    else leituraNps = 'O NPS está na zona de aperfeiçoamento — priorizar a experiência do cliente.';

    let leituraSla;
    if (sla >= 95) leituraSla = 'O SLA está em nível de excelência operacional.';
    else if (sla >= 85) leituraSla = 'O SLA está consistente, mas há espaço para ganhos incrementais.';
    else leituraSla = 'O SLA precisa de atenção — revise gargalos operacionais.';

    frases.push(strong('NPS: ') + leituraNps);
    frases.push(strong('SLA: ') + leituraSla);

    return frases.map(f => `<p>${f}</p>`).join('');
  };

  /* ---------- Render ---------- */
  const MAP = {
    geral: 'insightGeralBody',
    lucros: 'insightLucrosBody',
    demanda: 'insightDemandaBody',
    estoque: 'insightEstoqueBody',
    desempenho: 'insightDesempenhoBody',
  };

  function render(view) {
    const hostId = MAP[view];
    if (!hostId) return;
    const host = document.getElementById(hostId);
    if (!host) return;

    const builder = BUILDERS[view];
    if (!builder) return;

    try {
      const html = builder();
      host.innerHTML = html || '<p class="insight-empty">Sem dados suficientes para gerar resumo.</p>';
    } catch (err) {
      console.warn('[insights] Erro ao gerar resumo:', err);
      host.innerHTML = '<p class="insight-empty">Não foi possível gerar o resumo.</p>';
    }
  }

  /* ---------- Botão copiar ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy-insight]');
    if (!btn) return;

    const view = btn.dataset.copyInsight;
    const hostId = MAP[view];
    const host = hostId ? document.getElementById(hostId) : null;
    if (!host) return;

    const texto = host.innerText.replace(/\s+/g, ' ').trim();
    const original = btn.innerHTML;

    const feedback = () => {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg><span>Copiado!</span>';
      setTimeout(() => { btn.innerHTML = original; }, 1600);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(feedback).catch(feedback);
    } else {
      // Fallback para navegadores antigos
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); feedback(); } catch {}
      document.body.removeChild(ta);
    }
  });

  /* ---------- Exposição ---------- */
  window.Insights = { render, BUILDERS };
})();