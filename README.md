# Legado RH — Sistema de Gestão de Funcionários

Sistema interno da **LEGADO ACLAMADO — UNIPESSOAL LDA** para gestão de funcionários, com separação automática por país de destacamento (Bélgica, Portugal e Outros).

🔗 **Aplicação online:** https://espacoprovavel.github.io/CONTROLELEGADOACLAMADO/

---

## O que é

Uma aplicação web **100% offline**, num **único ficheiro HTML**, que corre inteiramente no navegador:

- **Sem servidor, sem cloud** — os dados nunca saem do computador
- **Armazenamento local** (`localStorage` do navegador)
- **Exportação PDF** individual, consolidada e por grupo
- **Exportação ZIP** com fichas individuais + consolidado + backup JSON + CSV
- **Backup / importação JSON** para mover dados entre computadores
- **Pesquisa instantânea** por nome, NIF, NISS, função, cliente ou CC
- **3 secções separadas** por país de destacamento: 🇧🇪 Bélgica · 🇵🇹 Portugal · 🌐 Outros
- Dependências apenas via CDN (jsPDF, JSZip, FileSaver) — necessário ligação à Internet **no primeiro carregamento**

---

## Como usar (utilizador final)

1. **Abrir** o link da aplicação no navegador (Chrome, Edge ou Firefox).
2. **Clicar em "＋ Novo Funcionário"**, preencher a ficha e **Guardar**.
3. **Fazer backup regularmente** com o botão **"💾 Backup JSON"** (guarde o ficheiro em local seguro).

---

## ⚠️ Avisos críticos sobre os dados

- Os dados ficam **apenas no navegador deste computador** (`localStorage`). Não há cópia na nuvem.
- **Limpar o histórico/dados do navegador APAGA todos os funcionários.** Faça backup antes.
- Os dados **não são partilhados entre computadores** automaticamente. Para passar de um PC para outro, use **Backup JSON** num e **Importar** no outro.
- **O backup é da sua responsabilidade.** Recomenda-se backup semanal — ver [docs/BACKUP.md](docs/BACKUP.md).
- Cada navegador/perfil tem o seu próprio armazenamento separado.

---

## Como editar o sistema

Existem três formas de editar o ficheiro `index.html`:

1. **Pelo site do GitHub** (mais simples): abrir o ficheiro, clicar no lápis ✏️, editar e gravar (*Commit changes*).
2. **GitHub Desktop**: clonar o repositório, editar com um editor de texto e fazer *Commit* + *Push*.
3. **Linha de comandos (CLI)**: `git clone`, editar, `git add`, `git commit`, `git push`.

Guia detalhado com exemplos práticos em [docs/COMO_EDITAR.md](docs/COMO_EDITAR.md).

---

## Estrutura do repositório

```
CONTROLELEGADOACLAMADO/
├── index.html              # Sistema completo (raiz do GitHub Pages)
├── README.md               # Este ficheiro
├── CHANGELOG.md            # Histórico de versões
├── LICENSE                 # Licença privada
├── .gitignore              # Ignora backups locais
└── docs/
    ├── INSTALACAO.md       # Guia de setup inicial
    ├── COMO_EDITAR.md      # Guia de edição
    ├── BACKUP.md           # Procedimento de backup
    └── RGPD.md             # Avisos de proteção de dados
```

---

## RGPD — Proteção de Dados

Este sistema trata **dados pessoais** de trabalhadores (identificação, documentação, contactos, dados bancários). A empresa é responsável pelo cumprimento do **RGPD** e da legislação portuguesa.

- Armazenamento **local**, sem tracking, sem envio para terceiros.
- Conservação recomendada: **5 anos** após cessação do contrato.
- Backups devem ser **encriptados** e o acesso **restrito**.

Leia o aviso completo em [docs/RGPD.md](docs/RGPD.md).

---

## Backup (resumo)

| Frequência | O quê | Onde |
|------------|-------|------|
| Semanal | Backup JSON | Pasta local segura |
| Mensal | ZIP completo encriptado | Disco externo / cofre |
| Trimestral | Arquivo histórico imutável | Off-site |

Regra **3-2-1**: 3 cópias, 2 suportes diferentes, 1 off-site. Procedimento completo em [docs/BACKUP.md](docs/BACKUP.md).

---

## Resolução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Os funcionários desapareceram | Histórico/dados do navegador limpos | Importar o último Backup JSON |
| PDF/ZIP não gera | Sem Internet no 1.º carregamento (CDN não carregou) | Ligar à Internet e recarregar a página |
| Dados não aparecem noutro PC | `localStorage` é por computador | Exportar Backup JSON e Importar no outro PC |
| Acentos errados no Excel | Codificação | O CSV exportado já inclui BOM UTF-8; abrir via *Importar dados* |
| Página não abre online | GitHub Pages desactivado ou repo privado | Ver [docs/INSTALACAO.md](docs/INSTALACAO.md) |
| Banner amarelo de backup | Passaram >7 dias desde o último backup | Clicar em "Fazer backup agora" |

---

**Versão actual:** v1.2

© 2026 LEGADO ACLAMADO — UNIPESSOAL LDA · Todos os direitos reservados.
