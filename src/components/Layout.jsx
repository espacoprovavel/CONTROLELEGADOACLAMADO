import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import AvisoLegal from './AvisoLegal.jsx';

export default function Layout() {
  const { user, sair } = useAuth();
  const { empresas, empresaId, selecionar, empresa } = useEmpresa();
  const ativas = empresas.filter((e) => !e.arquivada);

  return (
    <>
      <header className="app-header">
        <span className="logo">EP · Espaço Provável</span>
        <div className="empresa-selector">
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Empresa:</span>
          <select value={empresaId || ''} onChange={(e) => selecionar(e.target.value)}>
            {ativas.length === 0 && <option value="">— sem empresas —</option>}
            {ativas.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}{e.nif ? ` (${e.nif})` : ''}</option>
            ))}
          </select>
        </div>
        <span className="spacer" />
        <span className="user">{user?.email}</span>
        <button className="ghost" onClick={sair}>Sair</button>
      </header>

      <div className="app-body">
        <nav className="app-nav">
          <Item to="/" label="📊 Painel" end />
          <div className="grupo">Recursos Humanos</div>
          <Item to="/funcionarios" label="👥 Funcionários" />
          <Item to="/salario-rapido" label="⚡ Salário rápido" />
          <Item to="/recibo-pt" label="🇵🇹 Recibo (Portugal)" />
          <Item to="/salario" label="🧮 Cálculo salarial" />
          <div className="grupo">Fiscal</div>
          <Item to="/iva" label="🧾 IVA" />
          <Item to="/irc" label="📈 IRC" />
          <Item to="/proformas" label="📄 Pró-formas" />
          <Item to="/calendario" label="📅 Calendário fiscal" />
          <div className="grupo">Gestão</div>
          <Item to="/empresas" label="🏢 Empresas" />
          <Item to="/configuracao" label="⚙️ Configuração" />
        </nav>

        <main className="app-main">
          <div style={{ marginBottom: '1rem' }}><AvisoLegal /></div>
          {!empresa && <div className="card"><p className="muted">Nenhuma empresa selecionada. Crie a primeira em <strong>Empresas</strong>.</p></div>}
          <Outlet />
        </main>
      </div>
    </>
  );
}

function Item({ to, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      {label}
    </NavLink>
  );
}
