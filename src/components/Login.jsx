import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { entrar, recuperar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [aguardar, setAguardar] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setErro(''); setMsg(''); setAguardar(true);
    try {
      await entrar(email.trim(), senha);
    } catch (err) {
      setErro(traduzErro(err.code));
    } finally {
      setAguardar(false);
    }
  }

  async function esqueci() {
    setErro(''); setMsg('');
    if (!email.trim()) { setErro('Escreva o seu email primeiro.'); return; }
    try {
      await recuperar(email.trim());
      setMsg('Email de recuperação enviado. Verifique a caixa de entrada.');
    } catch (err) {
      setErro(traduzErro(err.code));
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submeter}>
        <div className="brand-badge">EP</div>
        <h1>Espaço Provável</h1>
        <p className="sub">Gestão de RH &amp; Fiscal — ferramenta interna</p>

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />

        <label>Palavra-passe</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />

        {erro && <p className="erro">{erro}</p>}
        {msg && <p className="ok">{msg}</p>}

        <button type="submit" disabled={aguardar} style={{ width: '100%', marginTop: '0.4rem' }}>
          {aguardar ? 'A entrar…' : 'Entrar'}
        </button>
        <button type="button" className="sec" onClick={esqueci} style={{ width: '100%', marginTop: '0.5rem' }}>
          Esqueci a palavra-passe
        </button>
      </form>
    </div>
  );
}

function traduzErro(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou palavra-passe incorretos.';
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Tente mais tarde.';
    case 'auth/network-request-failed':
      return 'Sem ligação à Internet.';
    default:
      return 'Não foi possível entrar. Verifique os dados e a ligação.';
  }
}
