// Arredondamento determinístico a N casas decimais (meio para cima).
// Usado em todos os cálculos para reproduzir os recibos do contabilista.
export function arred(valor, casas = 2) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return 0;
  const f = Math.pow(10, casas);
  // +Number.EPSILON evita erros de vírgula flutuante (ex.: 1.005)
  return Math.round((valor + Number.EPSILON) * f) / f;
}

// Formata um número como moeda em euros, formato português (1 234,56 €)
export function eur(valor) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(arred(valor || 0));
}

// Formata uma percentagem (23 → "23%")
export function pct(valor) {
  return `${new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 4 }).format(valor || 0)}%`;
}
