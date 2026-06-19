import { novoDoc, finalizar, autoTable, AZUL } from './pdfBase.js';
import { eur } from '../calculo/arred.js';

// ---------- PDF COMPLETO (todos os detalhes, fórmulas, taxas) ----------
export function pdfReciboCompleto({ empresa, periodo, funcionario, recibo }) {
  const { doc, y } = novoDoc({ empresa, titulo: 'Recibo de vencimento (detalhe completo)', periodo });

  if (funcionario) {
    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { fontSize: 8 },
      body: [[
        `Nome: ${funcionario.nome || '—'}`,
        `NIF: ${funcionario.nif || '—'}`,
        `NISS: ${funcionario.niss || '—'}`,
        `Categoria: ${funcionario.categoria || '—'}`,
      ]],
    });
  }

  autoTable(doc, {
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 3 : y,
    head: [['Cód.', 'Descrição', 'Fórmula / taxa', 'Valor']],
    body: recibo.rubricas.map((r) => [String(r.codigo), r.descricao, r.formula, eur(r.valor)]),
    headStyles: { fillColor: AZUL, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    columnStyles: { 0: { cellWidth: 12 }, 3: { halign: 'right', cellWidth: 24 } },
  });

  const t = recibo.totais;
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    theme: 'grid',
    body: [
      ['Total ilíquido', eur(t.totalIliquido)],
      ['Base de Segurança Social', eur(t.baseSS)],
      [`Desconto SS`, '− ' + eur(t.descontoSS)],
      [`Retenção IRS${t.irsTaxa ? ` (${t.irsTaxa}%)` : ''}`, '− ' + eur(t.irs)],
      ['LÍQUIDO A RECEBER', eur(t.liquido)],
      ['SS entidade', eur(t.ssEntidade)],
      ['CUSTO TOTAL P/ EMPRESA', eur(t.custoEmpresa)],
    ],
    styles: { fontSize: 8.5 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    didParseCell: (d) => {
      if (['LÍQUIDO A RECEBER', 'CUSTO TOTAL P/ EMPRESA'].includes(d.row.raw[0])) {
        d.cell.styles.fillColor = [232, 240, 248];
        d.cell.styles.textColor = AZUL;
      }
    },
  });

  if (recibo.avisos?.length) {
    let yy = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(7.5);
    doc.setTextColor(160, 60, 30);
    recibo.avisos.forEach((a) => { doc.text(doc.splitTextToSize('⚠ ' + a, 180), 14, yy); yy += 6; });
  }

  finalizar(doc);
  return doc;
}

// ---------- PDF do RECIBO EDITÁVEL (modelo português) ----------
export function pdfReciboPT({ empresa, periodo, funcionario, recibo }) {
  const { doc, y } = novoDoc({ empresa, titulo: 'Recibo de Vencimento', periodo });

  if (funcionario) {
    autoTable(doc, {
      startY: y, theme: 'plain', styles: { fontSize: 8 },
      body: [[
        `Nome: ${funcionario.nome || '—'}`,
        `NIF: ${funcionario.nif || '—'}`,
        `NISS: ${funcionario.niss || '—'}`,
        `Categoria: ${funcionario.categoria || '—'}`,
      ]],
    });
  }

  autoTable(doc, {
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 3 : y,
    head: [['Cód.', 'Descrição', 'SS', 'IRS', 'Valor']],
    body: recibo.detalhe.map((l) => [String(l.codigo || ''), l.descricao || '', l.incideSS ? 'Sim' : '—', l.incideIRS ? 'Sim' : '—', eur(l.valor)]),
    headStyles: { fillColor: AZUL, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.6 },
    columnStyles: { 0: { cellWidth: 14 }, 2: { halign: 'center', cellWidth: 16 }, 3: { halign: 'center', cellWidth: 16 }, 4: { halign: 'right', cellWidth: 28 } },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    theme: 'grid',
    body: [
      ['Total de remunerações', eur(recibo.totalRem)],
      ['Base de Segurança Social', eur(recibo.baseSS)],
      [`Desconto SS (${recibo.taxaSS}%)`, '− ' + eur(recibo.descontoSS)],
      [`Retenção IRS${recibo.irsTaxa ? ` (${recibo.irsTaxa}%)` : ''}`, '− ' + eur(recibo.irs)],
      ['LÍQUIDO A RECEBER', eur(recibo.liquido)],
      [`SS entidade (${recibo.taxaSSEnt}%)`, eur(recibo.ssEntidade)],
      ['CUSTO TOTAL P/ EMPRESA', eur(recibo.custoEmpresa)],
    ],
    styles: { fontSize: 8.5 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    didParseCell: (d) => {
      if (['LÍQUIDO A RECEBER', 'CUSTO TOTAL P/ EMPRESA'].includes(d.row.raw[0])) {
        d.cell.styles.fillColor = [232, 240, 248];
        d.cell.styles.textColor = AZUL;
      }
    },
  });

  if (recibo.irsAviso) {
    const yy = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(7.5); doc.setTextColor(160, 60, 30);
    doc.text(doc.splitTextToSize('⚠ ' + recibo.irsAviso, 180), 14, yy);
  }

  finalizar(doc);
  return doc;
}

// ---------- PDF SIMPLES (para o contabilista) ----------
export function pdfReciboSimples({ empresa, periodo, funcionario, recibo }) {
  const { doc, y } = novoDoc({ empresa, titulo: 'Resumo de vencimento (contabilista)', periodo });
  const t = recibo.totais;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Campo', 'Valor']],
    body: [
      ['Nome', funcionario?.nome || '—'],
      ['NIF', funcionario?.nif || '—'],
      ['NISS', funcionario?.niss || '—'],
      ['Categoria', funcionario?.categoria || '—'],
      ['Vencimento', eur(t.vencimento)],
      ['Subsídio de férias (duod.)', eur(t.subFerias)],
      ['Subsídio de Natal (duod.)', eur(t.subNatal)],
      ['Subsídio de alimentação', eur(t.subAlimentacao)],
      ['Ajudas de custo (isentas)', eur(t.ajudasIsentas)],
      ['Base de SS', eur(t.baseSS)],
      ['Desconto SS', eur(t.descontoSS)],
      ['Retenção IRS', eur(t.irs)],
      ['Líquido a receber', eur(t.liquido)],
    ],
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
  });
  finalizar(doc);
  return doc;
}
