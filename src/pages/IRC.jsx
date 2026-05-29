import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { useConfig } from '../hooks/useConfig.js';
import { estimarIRC } from '../lib/calculo/irc.js';
import { eur } from '../lib/calculo/arred.js';

export default function IRC() {
  const { empresaId, empresa } = useEmpresa();
  const { config } = useConfig();
  const [rendimentos, setRendimentos] = useState('');
  const [gastos, setGastos] = useState('');
  const [custoPessoal, setCustoPessoal] = useState('');
  const [custoAuto, setCustoAuto] = useState(0);

  // Puxar custo de pessoal do histórico de recibos da MESMA empresa
  useEffect(() => {
    if (!empresaId) return;
    return onSnapshot(collection(db, 'empresas', empresaId, 'recibos'), (snap) => {
      const total = snap.docs.reduce((acc, d) => acc + (d.data()?.custoEmpresa || 0), 0);
      setCustoAuto(total);
    });
  }, [empresaId]);

  if (!empresa || !config) return null;
  const custo = custoPessoal !== '' ? Number(custoPessoal) : custoAuto;
  const r = estimarIRC({ rendimentos: Number(rendimentos) || 0, gastos: Number(gastos) || 0, custoPessoal: custo, configIRC: config.irc });

  return (
    <>
      <div className="card">
        <h2>Estimador de IRC — {empresa.nome}</h2>
        <div className="grid3">
          <div><label>Rendimentos do ano (€)</label><input type="number" value={rendimentos} onChange={(e) => setRendimentos(e.target.value)} /></div>
          <div><label>Gastos dedutíveis (sem pessoal) (€)</label><input type="number" value={gastos} onChange={(e) => setGastos(e.target.value)} /></div>
          <div>
            <label>Custo de pessoal (€)</label>
            <input type="number" value={custoPessoal} onChange={(e) => setCustoPessoal(e.target.value)} placeholder={`auto: ${custoAuto.toFixed(2)}`} />
          </div>
        </div>
        <p className="muted">Custo de pessoal automático (histórico de recibos desta empresa): <strong>{eur(custoAuto)}</strong>. Deixe o campo vazio para usar este valor.</p>
      </div>

      <div className="card">
        <h3>Estimativa</h3>
        <div style={{ maxWidth: 460 }}>
          <div className="total-line"><span>Lucro tributável</span><span>{eur(r.lucroTributavel)}</span></div>
          <div className="total-line"><span>Coleta (IRC)</span><span>{eur(r.coleta)}</span></div>
          <div className="total-line"><span>Derrama municipal</span><span>{eur(r.derrama)}</span></div>
          <div className="total-line big"><span>IRC estimado do ano</span><span>{eur(r.ircTotal)}</span></div>
          <div className="total-line"><span>Pagamentos por conta (≈)</span><span>{eur(r.pagamentosPorConta)}</span></div>
          <div className="total-line"><span>Cada prestação (×3)</span><span>{eur(r.prestacaoPorConta)}</span></div>
        </div>
        <div style={{ marginTop: '0.6rem' }}>
          {r.passos.map((p, i) => <span key={i} className="formula">{p}</span>)}
        </div>
        <p className="muted">{config.prazos.pagamentoContaIRC}</p>
      </div>
    </>
  );
}
