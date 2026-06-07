import { novoDoc, finalizar, autoTable, AZUL } from './pdfBase.js';
import { eur } from '../calculo/arred.js';

export function pdfIVA({ empresa, periodo, apuramento, faturas }) {
  const { doc, y } = novoDoc({ empresa, titulo: 'Apuramento de IVA', periodo });
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    body: [
      ['Base emitida', eur(apuramento.baseEmitida)],
      ['IVA liquidado', eur(apuramento.ivaLiquidado)],
      ['Base recebida', eur(apuramento.baseRecebida)],
      ['IVA dedutível', '− ' + eur(apuramento.ivaDedutivel)],
      [apuramento.saldo >= 0 ? 'IVA A ENTREGAR' : 'IVA A RECUPERAR', eur(apuramento.saldo >= 0 ? apuramento.aEntregar : apuramento.aRecuperar)],
    ],
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  });
  if (faturas?.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['Tipo', 'Data', 'NIF', 'Base', 'Taxa', 'IVA']],
      body: faturas.map((f) => [f.tipo, f.data || '—', f.nif || '—', eur(f.base), `${f.taxa}%`, eur(f.valor)]),
      headStyles: { fillColor: AZUL, fontSize: 8 },
      styles: { fontSize: 7.5 },
    });
  }
  finalizar(doc);
  return doc;
}

export function pdfIRC({ empresa, ano, estimativa }) {
  const { doc, y } = novoDoc({ empresa, titulo: 'Estimativa de IRC', periodo: ano });
  const e = estimativa;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    body: [
      ['Lucro tributável', eur(e.lucroTributavel)],
      ['Coleta (IRC)', eur(e.coleta)],
      ['Derrama municipal', eur(e.derrama)],
      ['IRC ESTIMADO DO ANO', eur(e.ircTotal)],
      ['Pagamentos por conta (≈)', eur(e.pagamentosPorConta)],
    ],
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  });
  let yy = doc.lastAutoTable.finalY + 5;
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  e.passos.forEach((p) => { doc.text(doc.splitTextToSize('• ' + p, 180), 14, yy); yy += 5; });
  finalizar(doc);
  return doc;
}
