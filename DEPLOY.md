# Pôr a app ONLINE com login (passo a passo)

A app é 100% gratuita: corre no plano **Spark** do Firebase. O login funciona
com **Firebase Authentication** (email + palavra-passe). Segue estes passos.

> Estes comandos correm no **teu computador** (ou numa sessão Claude Code ligada
> ao repositório novo). Esta sessão atual não tem credenciais para publicar.

## 1. Pré-requisitos (uma vez)
```bash
node -v          # precisa de Node 18+
npm install -g firebase-tools
```

## 2. Configurar as chaves
```bash
cp .env.example .env
# Edita .env com as chaves do TEU projeto Firebase (ou usa as que já lá estão,
# do projeto controle-legado-aclamado).
```

## 3. Ativar serviços na consola Firebase (uma vez)
Em https://console.firebase.google.com → projeto `controle-legado-aclamado`:
1. **Authentication → Sign-in method → Email/Palavra-passe → Ativar.**
2. **Authentication → Users → Adicionar utilizador:** cria os **2 utilizadores**
   (gestora e dono) com email + palavra-passe. (Não há senhas no código.)
3. **Firestore Database → Criar base de dados** (modo de produção, região europe-west).

## 4. Instalar, testar e construir
```bash
npm install
npm test          # confirma os 13 testes (inclui recibo real Legado abr/2026)
npm run build     # gera a pasta dist/
```

## 5. Publicar
```bash
firebase login                 # abre o browser para autenticar
firebase deploy                # publica Hosting + Firestore rules
```
No fim, o terminal mostra o link, do género:
**https://controle-legado-aclamado.web.app**

Abre o link → aparece o ecrã de **login**. Entra com um dos 2 utilizadores.
Sem login, ninguém vê nada (garantido pelas Security Rules).

## 6. Primeira utilização
1. Entra na app.
2. Vai a **Empresas** e cria a primeira (ex.: LEGADO ACLAMADO – UNIPESSOAL LDA,
   NIF 517458870, regime de IVA Trimestral). A configuração de 2026 é semeada
   automaticamente e fica editável em **Configuração**.
3. Adiciona funcionários, faz cálculos, etc.

---

## Alternativa: publicar no GitHub Pages
Se preferires GitHub Pages em vez de Firebase Hosting:
1. Em `vite.config.js` mete `base: '/NOME-DO-REPO/'`.
2. `npm run build` e publica a pasta `dist/` (ex.: com a action de Pages ou
   empurrando para um branch `gh-pages`). O login Firebase funciona na mesma.
