import * as XLSX from 'xlsx';

// Exporta uma lista de objetos para Excel (.xlsx).
export function exportarExcel(linhas, nomeFicheiro = 'export.xlsx', nomeFolha = 'Dados') {
  const ws = XLSX.utils.json_to_sheet(linhas || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nomeFolha);
  XLSX.writeFile(wb, nomeFicheiro);
}

// Exporta para CSV com BOM UTF-8 (acentos corretos no Excel).
export function exportarCSV(linhas, nomeFicheiro = 'export.csv') {
  const ws = XLSX.utils.json_to_sheet(linhas || []);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  baixar(blob, nomeFicheiro);
}

// Exporta um objeto/array como JSON (backup).
export function exportarJSON(dados, nomeFicheiro = 'backup.json') {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  baixar(blob, nomeFicheiro);
}

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
