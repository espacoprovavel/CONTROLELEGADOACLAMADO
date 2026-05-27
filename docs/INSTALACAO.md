# Guia de Instalação

Este guia explica como colocar o sistema **Legado RH** online através do GitHub Pages, do zero.

---

## 1. Criar conta GitHub (se ainda não tiver)

1. Aceda a https://github.com/signup
2. Indique email, password e nome de utilizador.
3. Confirme o email.

---

## 2. Criar o repositório

1. Clique em **New repository** (botão verde).
2. Nome: `CONTROLELEGADOACLAMADO`
3. Visibilidade: ver o **aviso crítico** no ponto 5 antes de decidir.
4. Clique em **Create repository**.

---

## 3. Carregar os ficheiros (3 opções)

### Opção A — Pelo site do GitHub (mais simples)
1. No repositório, clique em **Add file → Upload files**.
2. Arraste o `index.html` e os restantes ficheiros.
3. Escreva uma mensagem e clique em **Commit changes**.

### Opção B — GitHub Desktop
1. Instale o **GitHub Desktop** (https://desktop.github.com).
2. **Clone** o repositório para o seu PC.
3. Copie os ficheiros para a pasta clonada.
4. Faça **Commit** e depois **Push origin**.

### Opção C — Linha de comandos (CLI)
```bash
git clone https://github.com/espacoprovavel/CONTROLELEGADOACLAMADO.git
cd CONTROLELEGADOACLAMADO
# copiar ficheiros para aqui
git add .
git commit -m "Carregar sistema Legado RH"
git push origin main
```

---

## 4. Activar o GitHub Pages

1. No repositório: **Settings → Pages**.
2. Em **Build and deployment → Source**: selecione **Deploy from a branch**.
3. **Branch**: `main` · **Folder**: `/ (root)`.
4. Clique em **Save**.

---

## 5. ⚠️ AVISO CRÍTICO — GitHub Pages e repositórios privados

> **No plano gratuito do GitHub, o GitHub Pages só funciona em repositórios PÚBLICOS.**

Se o repositório for **privado** com plano gratuito, a página **não fica acessível** online. Soluções:

### a) Recomendado — repositório público, SEM dados reais no código
- O `index.html` **não contém dados de funcionários** — os dados reais ficam apenas no `localStorage` do PC de quem usa.
- Pode tornar o repositório **público** com segurança, desde que **nunca** coloque dados reais dentro do código ou em ficheiros commitados.
- ✅ Esta é a opção mais simples e gratuita.

### b) GitHub Pro (≈ 4 USD/mês) — repositório privado
- Permite GitHub Pages em repositórios privados.

### c) Cloudflare Pages (gratuito, suporta repositórios privados)
- Ligar o repositório ao **Cloudflare Pages** e publicar a partir de lá.

---

## 6. Testar o URL final

Após 1-2 minutos, aceda a:

```
https://espacoprovavel.github.io/CONTROLELEGADOACLAMADO/
```

Deve abrir o sistema com o funcionário de demonstração.

---

## 7. Primeira edição de teste

1. Clique em **＋ Novo Funcionário**.
2. Preencha Nome, NIF, Função e Data de admissão.
3. **Guardar** e confirme que aparece na tabela.
4. Faça um **Backup JSON** para testar a exportação.

---

## 8. Checklist final

- [ ] Repositório criado e ficheiros carregados
- [ ] GitHub Pages activado (branch `main`, root)
- [ ] Decisão sobre visibilidade (ver ponto 5)
- [ ] URL abre corretamente
- [ ] Funcionário de demonstração visível
- [ ] Backup JSON testado
- [ ] Equipa informada de que **NÃO** deve colocar dados reais no código
