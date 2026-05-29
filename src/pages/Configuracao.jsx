import { useEffect, useState } from 'react';
import { useConfig } from '../hooks/useConfig.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { SITUACOES_FAMILIARES } from '../lib/configDefaults.js';

export default function Configuracao() {
  const { config, guardar, repor } = useConfig();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [msg, setMsg] = useState('');
  const [tabelaTxt, setTabelaTxt] = useState('');

  useEffect(() => { if (config) setC(JSON.parse(JSON.stringify(config))); }, [config]);
  if (!c) return <div className="card"><p className="muted">A carregar configuração…</p></div>;

  const upd = (path, val) => {
    setC((prev) => {
      const novo = JSON.parse(JSON.stringify(prev));
      let o = novo; const ks = path.split('.');
      for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
      o[ks[ks.length - 1]] = val;
      return novo;
    });
  };

  async function guardarTudo() {
    await guardar(c, { campo: 'configuração', antigo: '—', novo: 'alteração manual', quem: user?.email });
    setMsg('Configuração guardada.'); setTimeout(() => setMsg(''), 3000);
  }

  function aplicarTabelaIRS() {
    // Formato colado: cada linha "ate;taxa" (ex.: 1000;13.5)
    try {
      const linhas = tabelaTxt.trim().split('\n').filter(Boolean);
      const escaloes = linhas.map((l) => {
        const [ate, taxa] = l.split(/[;\t,]/).map((x) => Number(x.replace(',', '.').trim()));
        return { ate, taxa };
      });
      upd(`irs.tabela.${sitSel}`, escaloes);
      setMsg(`Tabela de IRS (${sitSel}) com ${escaloes.length} escalões pronta. Carregue em "Guardar".`);
    } catch {
      setMsg('Formato inválido. Use uma linha por escalão: limite;taxa');
    }
  }

  const [sitSel, setSitSel] = useState('solteiro');

  return (
    <>
      <div className="card">
        <h2>Configuração da empresa — parâmetros 2026 (editáveis)</h2>
        <p className="muted">Os cálculos leem sempre estes valores. Ao mudar uma taxa, indique a data de vigência; períodos já calculados mantêm a taxa antiga.</p>
      </div>

      <div className="card">
        <h3>Segurança Social e bases</h3>
        <div className="grid3">
          <Num label="SS trabalhador (%)" v={c.ss.taxaTrabalhador} on={(x) => upd('ss.taxaTrabalhador', x)} />
          <Num label="SS entidade (%)" v={c.ss.taxaEntidade} on={(x) => upd('ss.taxaEntidade', x)} />
          <Num label="IAS (€)" v={c.ias} on={(x) => upd('ias', x)} />
          <Num label="Salário mínimo (€)" v={c.salarioMinimo} on={(x) => upd('salarioMinimo', x)} />
          <Num label="Meses de salário" v={c.mesesSalario} on={(x) => upd('mesesSalario', x)} />
          <Num label="Horas mês completo" v={c.horasMes} on={(x) => upd('horasMes', x)} />
          <Num label="Dias úteis/mês" v={c.diasUteisMes} on={(x) => upd('diasUteisMes', x)} />
          <Num label="Subs. refeição dinheiro (€/dia)" v={c.subsidioRefeicao.dinheiro} on={(x) => upd('subsidioRefeicao.dinheiro', x)} />
          <Num label="Subs. refeição cartão (€/dia)" v={c.subsidioRefeicao.cartao} on={(x) => upd('subsidioRefeicao.cartao', x)} />
        </div>
      </div>

      <div className="card">
        <h3>IVA e IRC</h3>
        <div className="grid3">
          <div>
            <label>Regime de IVA</label>
            <select value={c.regimeIVA} onChange={(e) => upd('regimeIVA', e.target.value)}>
              <option value="TRIMESTRAL">Trimestral</option><option value="MENSAL">Mensal</option>
            </select>
          </div>
          <Num label="IRC normal (%)" v={c.irc.taxaNormal} on={(x) => upd('irc.taxaNormal', x)} />
          <Num label="IRC PME (%)" v={c.irc.taxaPME} on={(x) => upd('irc.taxaPME', x)} />
          <Num label="Limite PME (€)" v={c.irc.limitePME} on={(x) => upd('irc.limitePME', x)} />
          <Num label="Derrama municipal (%)" v={c.irc.derramaMunicipal} on={(x) => upd('irc.derramaMunicipal', x)} />
          <Num label="Mínimo existência IRS (€/ano)" v={c.irs.minimoExistenciaAno} on={(x) => upd('irs.minimoExistenciaAno', x)} />
        </div>
        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' }}>
          <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={c.irc.pmeAtiva} onChange={(e) => upd('irc.pmeAtiva', e.target.checked)} />
          Aplicar taxa reduzida PME
        </label>
      </div>

      <div className="card">
        <h3>Tabela de retenção de IRS</h3>
        <p className="muted">Cole a tabela oficial — uma linha por escalão no formato <code>limite;taxa</code> (ex.: <code>1200;13.5</code>). Não inventamos valores.</p>
        <div className="grid2">
          <div>
            <label>Situação familiar</label>
            <select value={sitSel} onChange={(e) => setSitSel(e.target.value)}>
              {SITUACOES_FAMILIARES.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div><label>Escalões atuais ({sitSel})</label><input disabled value={`${(c.irs.tabela?.[sitSel] || []).length} escalões`} /></div>
        </div>
        <textarea rows={5} value={tabelaTxt} onChange={(e) => setTabelaTxt(e.target.value)} placeholder={'1000;0\n1200;13.5\n2000;21'} />
        <button className="sec" onClick={aplicarTabelaIRS}>Aplicar tabela ({sitSel})</button>
      </div>

      {msg && <p className="ok">{msg}</p>}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <button onClick={guardarTudo}>Guardar configuração</button>
        <button className="danger" onClick={async () => { if (confirm('Repor TODOS os valores de 2026 de origem?')) { await repor(user?.email); setMsg('Valores de 2026 repostos.'); } }}>Repor valores 2026 de origem</button>
      </div>

      {(c.historico || []).length > 0 && (
        <div className="card">
          <h3>Histórico de alterações</h3>
          <table>
            <thead><tr><th>Campo</th><th>Novo</th><th>Quem</th><th>Data</th></tr></thead>
            <tbody>{[...c.historico].reverse().map((h, i) => (
              <tr key={i}><td>{h.campo}</td><td>{h.novo}</td><td>{h.quem || '—'}</td><td>{h.data ? new Date(h.data).toLocaleString('pt-PT') : ''}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Num({ label, v, on }) {
  return <div><label>{label}</label><input type="number" step="any" value={v} onChange={(e) => on(Number(e.target.value))} /></div>;
}
