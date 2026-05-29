import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { eur } from '../lib/calculo/arred.js';

export default function Dashboard() {
  const { empresaId, empresa } = useEmpresa();
  const [funcionarios, setFuncionarios] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (!empresaId) return;
    const u1 = onSnapshot(collection(db, 'empresas', empresaId, 'funcionarios'), (s) => setFuncionarios(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'empresas', empresaId, 'recibos'), (s) => setRecibos(s.docs.map((d) => d.data())));
    const u3 = onSnapshot(collection(db, 'empresas', empresaId, 'calendario'), (s) => setEventos(s.docs.map((d) => d.data())));
    return () => { u1(); u2(); u3(); };
  }, [empresaId]);

  if (!empresa) return null;
  const hoje = new Date();
  const custoMes = recibos.reduce((a, r) => a + (r.custoEmpresa || 0), 0);
  const a1Expirar = funcionarios.filter((f) => f.a1Validade && (new Date(f.a1Validade) - hoje) / 86400000 <= 30);
  const proximas = eventos
    .map((e) => ({ ...e, dias: Math.ceil((new Date(e.data) - hoje) / 86400000) }))
    .filter((e) => e.dias >= 0).sort((a, b) => a.dias - b.dias).slice(0, 5);

  return (
    <>
      <div className="card">
        <h2>Painel — {empresa.nome}</h2>
        <p className="muted">{empresa.nif ? `NIF ${empresa.nif} · ` : ''}Regime de IVA {empresa.regimeIVA === 'MENSAL' ? 'mensal' : 'trimestral'}</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="label">Funcionários</div><div className="value">{funcionarios.length}</div></div>
        <div className="kpi"><div className="label">Custo de pessoal (histórico)</div><div className="value">{eur(custoMes)}</div></div>
        <div className="kpi"><div className="label">A1 a expirar (30 dias)</div><div className="value">{a1Expirar.length}</div></div>
        <div className="kpi"><div className="label">Próximas obrigações</div><div className="value">{proximas.length}</div></div>
      </div>

      {a1Expirar.length > 0 && (
        <div className="card" style={{ marginTop: '1.2rem' }}>
          <h3>⚠️ A1 / contratos a expirar</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            {a1Expirar.map((f) => <li key={f.id}>{f.nome} — A1 válido até {f.a1Validade}</li>)}
          </ul>
        </div>
      )}

      {proximas.length > 0 && (
        <div className="card">
          <h3>📅 Próximas obrigações fiscais</h3>
          <table>
            <thead><tr><th>Data</th><th>Tipo</th><th>Obrigação</th><th>Faltam</th></tr></thead>
            <tbody>{proximas.map((e, i) => <tr key={i}><td>{e.data}</td><td>{e.tipo}</td><td>{e.titulo}</td><td>{e.dias} dias</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
