import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TEXTO_AVISO_LEGAL } from '../../components/AvisoLegal.jsx';

const AZUL = [0, 51, 102];
const DOURADO = [212, 175, 55];

// Cria um documento A4 com cabeçalho (empresa) e devolve { doc, y }.
export function novoDoc({ empresa, titulo, periodo }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // Faixa azul
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, W, 26, 'F');
  doc.setFillColor(...DOURADO);
  doc.rect(0, 26, W, 1.2, 'F');

  doc.setTextColor(...DOURADO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Espaço Provável', 14, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo || '', 14, 19);

  // Dados da empresa (direita)
  doc.setFontSize(8);
  const linhasEmp = [
    empresa?.nome || '',
    empresa?.nif ? `NIF ${empresa.nif}` : '',
    [empresa?.morada, empresa?.codigoPostal, empresa?.localidade].filter(Boolean).join(', '),
  ].filter(Boolean);
  let yE = 9;
  linhasEmp.forEach((l) => { doc.text(l, W - 14, yE, { align: 'right' }); yE += 4; });

  let y = 34;
  if (periodo) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Período: ${periodo}   ·   Emitido: ${new Date().toLocaleDateString('pt-PT')}`, 14, y);
    y += 6;
  }
  doc.setTextColor(20, 20, 20);
  return { doc, y, W };
}

// Rodapé com aviso legal e numeração em todas as páginas.
export function finalizar(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...DOURADO);
    doc.line(14, H - 16, W - 14, H - 16);
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    const aviso = doc.splitTextToSize('⚠ ' + TEXTO_AVISO_LEGAL, W - 28);
    doc.text(aviso, 14, H - 12);
    doc.text(`Pág. ${i}/${total}`, W - 14, H - 5, { align: 'right' });
  }
  return doc;
}

export { autoTable, AZUL, DOURADO };
