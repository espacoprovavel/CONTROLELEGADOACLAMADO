import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { EmpresaProvider } from './contexts/EmpresaContext.jsx';
import Login from './components/Login.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Empresas from './pages/Empresas.jsx';
import Funcionarios from './pages/Funcionarios.jsx';
import CalculoSalario from './pages/CalculoSalario.jsx';
import SalarioRapido from './pages/SalarioRapido.jsx';
import ReciboPT from './pages/ReciboPT.jsx';
import Configuracao from './pages/Configuracao.jsx';
import IVA from './pages/IVA.jsx';
import IRC from './pages/IRC.jsx';
import ProFormas from './pages/ProFormas.jsx';
import CalendarioFiscal from './pages/CalendarioFiscal.jsx';

function Protegido() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>A carregar…</div>;
  if (!user) return <Login />;
  return (
    <EmpresaProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="salario-rapido" element={<SalarioRapido />} />
          <Route path="recibo-pt" element={<ReciboPT />} />
          <Route path="salario" element={<CalculoSalario />} />
          <Route path="iva" element={<IVA />} />
          <Route path="irc" element={<IRC />} />
          <Route path="proformas" element={<ProFormas />} />
          <Route path="calendario" element={<CalendarioFiscal />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="configuracao" element={<Configuracao />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </EmpresaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Protegido />
      </BrowserRouter>
    </AuthProvider>
  );
}
