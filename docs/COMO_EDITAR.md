# Como editar o sistema

O sistema é um **único ficheiro** (`index.html`) com HTML, CSS e JavaScript. Esta página mostra cenários práticos de edição.

> 💡 **Antes de qualquer alteração grande:** abra a aplicação e faça **Backup JSON**. Teste sempre localmente (abrindo o ficheiro no navegador) antes de publicar.

---

## Cenário 1 — Adicionar um campo novo à ficha

Exemplo: adicionar **"Carta de Condução"**. São 5 passos.

**1) Formulário (HTML)** — dentro da secção apropriada (ex.: secção 2 — Documentação), adicione:
```html
<div class="field">
  <label for="f_carta">Carta de Condução</label>
  <input type="text" id="f_carta">
</div>
```

**2) Guardar/Carregar (JS)** — adicione `'carta'` ao array `FIELDS`:
```javascript
const FIELDS = ['nome','nasc',/* ... */,'carta','obs'];
```
> Estando no array `FIELDS`, o campo é automaticamente preenchido (`openForm`) e guardado (`saveForm`).

**3) Vista de detalhe (JS)** — em `viewDetail`, adicione na secção certa:
```javascript
${detailItem('Carta de Condução', e.carta)}
```

**4) PDF (JS)** — em `drawEmployeePdf`, no array `sections`, adicione uma linha:
```javascript
['N.º Carta de Condução', e.carta],
```

**5) (Opcional) CSV** — para incluir no CSV, adicione `'carta'` ao array `cols` em `buildCsv`.

---

## Cenário 2 — Mudar cores

Todas as cores estão nas **variáveis CSS** no topo, em `:root`. Altere apenas estes valores:

```css
:root {
  --accent: #003366;   /* azul marinho oficial */
  --gold:   #D4AF37;   /* dourado oficial */
  /* ... */
}
```

Sugestões de paletas alternativas (apenas exemplos — manter a oficial salvo indicação):
- **Verde corporativo:** `--accent: #1b5e20; --gold: #c0a062;`
- **Bordô elegante:** `--accent: #5a1a2b; --gold: #c9a227;`

> Como o resto do CSS usa `var(--accent)` / `var(--gold)`, mudar aqui actualiza tudo.

---

## Cenário 3 — Mudar o nome da empresa

Procure por **`LEGADO ACLAMADO`** no ficheiro. Aparece em:
- Cabeçalho da página (`<div class="sub">`)
- Rodapé (`<footer>`)
- Cabeçalho do PDF (função `drawEmployeePdf`, texto `'LEGADO ACLAMADO — UNIPESSOAL LDA'`)

Substitua em **todos** os locais para manter coerência.

---

## Cenário 4 — Transformar um campo de texto em dropdown

Exemplo: transformar **cliente** num menu. Troque o `<input>`:
```html
<!-- antes -->
<input type="text" id="f_cliente">
```
```html
<!-- depois -->
<select id="f_cliente">
  <option value="">—</option>
  <option>Vleeshandel CIS & Seppe Van Den Broeck BV</option>
  <option>Outro cliente A</option>
  <option>Outro cliente B</option>
</select>
```
> O JS não muda: `FIELDS` lê/escreve `select` e `input` da mesma forma (via `.value`).

---

## Cenário 5 — Desfazer uma alteração (Git)

### Pelo site do GitHub
1. Abra o ficheiro → separador **History**.
2. Escolha a versão anterior → **<>** (View) → copie o conteúdo bom, ou
3. Use **Revert** no commit indesejado (via Pull Request).

### Pela linha de comandos
```bash
# ver histórico
git log --oneline

# desfazer o último commit mantendo alterações em disco
git revert HEAD

# OU voltar um ficheiro a uma versão específica
git checkout <hash-do-commit> -- index.html
git commit -m "Repor versão anterior do index.html"
git push origin main
```

---

## Avisos importantes

- **Limite do `localStorage`:** ~5 MB por navegador. Suficiente para milhares de fichas de texto, mas evite colar conteúdos enormes nas observações.
- **Testar localmente primeiro:** faça duplo-clique no `index.html` para abrir no navegador antes de publicar.
- **Backup antes de alterações grandes:** exporte sempre o Backup JSON.
- **Cuidado com aspas e acentos** ao editar JavaScript — um erro de sintaxe pode partir a página. Se algo parar de funcionar, abra a **Consola** do navegador (F12) para ver o erro.
