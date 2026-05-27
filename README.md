# Legado RH — Sistema de Gestão de Funcionários

Sistema interno da **LEGADO ACLAMADO — UNIPESSOAL LDA** para gestão de funcionários, com autenticação, permissões por perfil e sincronização em tempo real. Separação automática por país de destacamento (Bélgica, Portugal e Outros).

🔗 **Aplicação online:** https://espacoprovavel.github.io/CONTROLELEGADOACLAMADO/

> **Versão 2.0** — migrado de localStorage para **Firebase** (Authentication + Firestore). Agora requer **Internet** e **login**.

---

## O que é

Uma aplicação web num **único ficheiro HTML** ligada ao **Firebase**:

- **Login** com email + palavra-passe (Firebase Authentication)
- **3 níveis de permissões:** `admin` / `editor` / `viewer`
- **Sincronização em tempo real** entre utilizadores (Firestore `onSnapshot`)
- **Auditoria automática** de todas as alterações
- **Exportação PDF** individual, consolidada e por grupo
- **Exportação ZIP** (fichas individuais + consolidado + backup JSON + CSV)
- **Importação JSON** em lote (para migrar dados antigos)
- **Pesquisa instantânea** por nome, NIF, NISS, função, cliente ou CC
- **3 secções separadas** por país: 🇧🇪 Bélgica · 🇵🇹 Portugal · 🌐 Outros
- Identidade visual oficial (azul #003366 + dourado #D4AF37, Montserrat + Poppins)

---

## Como fazer login pela primeira vez

1. Abrir o link da aplicação no navegador (Chrome, Edge ou Firefox).
2. Introduzir **email** e **palavra-passe** da conta criada no Firebase.
3. Entrar. Os dados aparecem automaticamente e sincronizam em tempo real.

> Antes do primeiro login funcionar com permissões, é preciso o **setup inicial** dos perfis — ver [docs/FIREBASE.md](docs/FIREBASE.md).

---

## Roles e permissões

| Acção | viewer | editor | admin |
|-------|:------:|:------:|:-----:|
| Ver funcionários e fichas | ✅ | ✅ | ✅ |
| Exportar PDF / ZIP / CSV | ✅ | ✅ | ✅ |
| Criar / editar funcionários | ❌ | ✅ | ✅ |
| Importar JSON | ❌ | ✅ | ✅ |
| Eliminar funcionários | ❌ | ❌ | ✅ |
| Gerir utilizadores e roles | ❌ | ❌ | ✅ |
| Ver logs de auditoria | ❌ | ❌ | ✅ |

As permissões são aplicadas **no interface E nas Firestore Rules** (defesa em camadas).

---

## Como recuperar a palavra-passe

No ecrã de login, clicar em **"Esqueci a palavra-passe"** depois de escrever o email. O Firebase envia um email de recuperação. Em alternativa, um admin pode reiniciar a password no Firebase Console → Authentication.

---

## Como editar o sistema

O sistema continua a ser um único ficheiro `index.html`. Três formas de editar:

1. **Pelo site do GitHub** — abrir o ficheiro, lápis ✏️, editar, *Commit changes*.
2. **GitHub Desktop** — clonar, editar, *Commit* + *Push*.
3. **Linha de comandos (CLI)** — `git clone`, editar, `git add/commit/push`.

Guia detalhado em [docs/COMO_EDITAR.md](docs/COMO_EDITAR.md). Gestão do Firebase em [docs/FIREBASE.md](docs/FIREBASE.md).

---

## Estrutura do repositório

```
CONTROLELEGADOACLAMADO/
├── index.html              # Sistema completo (raiz do GitHub Pages)
├── setup.html              # Setup inicial dos perfis (usar uma vez, depois eliminar)
├── firestore.rules         # Regras de segurança Firestore
├── firestore.indexes.json  # Índices Firestore
├── README.md               # Este ficheiro
├── CHANGELOG.md            # Histórico de versões
├── LICENSE                 # Licença privada
├── .gitignore              # Ignora backups locais
└── docs/
    ├── INSTALACAO.md       # Guia de setup inicial
    ├── COMO_EDITAR.md      # Guia de edição
    ├── BACKUP.md           # Procedimento de backup
    ├── RGPD.md             # Avisos de proteção de dados
    └── FIREBASE.md         # Gestão Firebase (utilizadores, roles, logs, custos)
```

---

## RGPD — Proteção de Dados

Este sistema trata **dados pessoais** de trabalhadores. A empresa é responsável pelo cumprimento do **RGPD**.

- Dados em **Firestore** na região **europe-west** (UE).
- Acesso protegido por **autenticação** + **regras de segurança** por role.
- **Auditoria** de todas as alterações.
- Conservação recomendada: **5 anos** após cessação do contrato.

Aviso completo em [docs/RGPD.md](docs/RGPD.md).

---

## Backup (resumo)

Apesar de os dados estarem no Firebase, recomenda-se backup periódico:

| Frequência | O quê | Onde |
|------------|-------|------|
| Semanal | Backup JSON (botão na app) | Pasta local segura |
| Mensal | ZIP completo encriptado | Disco externo / cofre |
| Trimestral | Export do Firestore (Console) | Off-site |

Regra **3-2-1**. Procedimento completo em [docs/BACKUP.md](docs/BACKUP.md).

---

## Resolução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Não consigo entrar | Email/password errados | Usar "Esqueci a palavra-passe" ou pedir reset ao admin |
| Entro mas não edito | Role `viewer` | Pedir ao admin para mudar o role |
| "Sem perfil definido" | Falta documento em `users` | Admin cria o perfil (setup.html / modal Utilizadores) |
| Página não carrega dados | Sem Internet | Verificar ligação à rede |
| PDF/ZIP não gera | CDN não carregou | Recarregar a página com Internet |
| Acentos errados no Excel | Codificação | O CSV exportado já inclui BOM UTF-8 |
| Página não abre online | GitHub Pages / repo privado | Ver [docs/INSTALACAO.md](docs/INSTALACAO.md) |

---

**Versão actual:** v2.0

© 2026 LEGADO ACLAMADO — UNIPESSOAL LDA · Todos os direitos reservados.
