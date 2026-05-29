export const TEXTO_AVISO_LEGAL =
  'Estimativas de apoio à gestão. Não substituem contabilidade certificada nem software ' +
  'de faturação certificado pela Autoridade Tributária. As faturas legais têm de ser ' +
  'emitidas em software certificado.';

export default function AvisoLegal({ compacto = false }) {
  return (
    <div className="aviso-legal" role="note" style={compacto ? { fontSize: '0.7rem' } : undefined}>
      <strong>⚠️ Aviso legal:</strong> {TEXTO_AVISO_LEGAL}
    </div>
  );
}
