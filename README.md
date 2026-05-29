# Legado RH — Sistema de Gestão de Funcionários

Sistema interno da **LEGADO ACLAMADO — UNIPESSOAL LDA** para gestão de funcionários, com autenticação, permissões por perfil e sincronização em tempo real. Separação automática por país de destacamento (Bélgica, Portugal e Outros).

🔗 **Aplicação online:** https://espacoprovavel.github.io/CONTROLELEGADOACLAMADO/

> **Versão 3.0** — acrescenta **gestão fiscal e salarial** (cálculos exactos e auditáveis, sem IA): processamento de salários, faltas e baixas médicas, destacamento A1/contratos, dashboard da empresa e painel de Configurações totalmente editável. Mantém Firebase (Auth + Firestore) e anexação de documentos (Cloudinary). 100 % gratuito (plano Spark).

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
- **Documentos anexados** por funcionário (JPG/PNG/PDF via Cloudinary): upload, ver, descarregar, ZIP — ver [docs/CLOUDINARY.md](docs/CLOUDINARY.md)
- **Pesquisa instantânea** por nome, NIF, NISS, função, cliente ou CC
- **3 secções separadas** por país: 🇧🇪 Bélgica · 🇵🇹 Portugal · 🌐 Outros
- Identidade visual oficial (azul #003366 + dourado #D4AF37, Montserrat + Poppins)

### Novo na v3.0 — Gestão Fiscal e Salarial (sem IA)

Duas áreas na navegação: **👥 Funcionários** e **🏢 Empresa**.

- **Processamento de salários** por trabalhador (modo mês ou horas): SS trabalhador (11 %) e entidade (23,75 %), parte tributável do subsídio de refeição, base de IRS, retenção pela tabela, líquido a receber e custo total para a empresa. Cada parcela mostra **fórmula e taxa**. Histórico mensal guardado no Firestore.
- **Faltas e baixas médicas**: justificada/injustificada/baixa (CIT), em dias ou horas. Injustificada desconta 1/30 por dia e remove subsídio de refeição. As faltas alimentam automaticamente o salário do mês.
- **Destacamento A1 e contratos**: estado do A1, validade, base de SS (continua em Portugal), validação de renovações/duração do termo certo. Alertas no dashboard.
- **Dashboard da empresa**: custo de pessoal do mês, A1 a expirar, contratos a terminar e parâmetros em vigor.
- **Configurações 100 % editáveis** (Firestore): SS, IAS, RMMG, subsídios, taxas de IVA, IRC/PME, derrama, mínimo de existência, dias úteis/horas e a **tabela de retenção de IRS** (vazia por opção — cola-se a oficial). Histórico de alterações, data de vigência e botão "Repor valores 2026 de origem".
- **Recibos PDF** (completo para auditoria e simples para o contabilista) e **Exportar todos os dados** (JSON + CSV).

> ⚠️ **Aviso legal:** estimativas de apoio à gestão. Não substituem contabilidade certificada nem software de faturação certificado pela AT.

Guia completo em [docs/FISCAL.md](docs/FISCAL.md).

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
| Ver / descarregar documentos | ✅ | ✅ | ✅ |
| Anexar documentos | ❌ | ✅ | ✅ |
| Eliminar documentos | ❌ | ❌ | ✅ |
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
    ├── FIREBASE.md         # Gestão Firebase (utilizadores, roles, logs, custos)
    ├── CLOUDINARY.md       # Gestão de documentos anexados (Cloudinary)
    └── FISCAL.md           # Gestão fiscal e salarial (cálculos, configurações)
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

**Versão actual:** v3.0

© 2026 LEGADO ACLAMADO — UNIPESSOAL LDA · Todos os direitos reservados.
