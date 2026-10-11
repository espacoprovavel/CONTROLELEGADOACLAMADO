/* ============================================================
   Teste de regressão — arranque dos blocos <script> do index.html

   O index.html tem dois blocos <script> principais que correm por ordem.
   Se o 1.º bloco ligar diretamente (ao arrancar) uma função que só existe
   no 2.º bloco — ex.: addEventListener('input', renderPastas) — o arranque
   do 1.º bloco rebenta com "X is not defined" e todos os botões ligados a
   seguir deixam de funcionar (foi o que impediu fechar a ficha do
   funcionário). Use uma referência tardia: () => funcao().

   Verifica também a sintaxe de todos os blocos <script> embutidos.

   Correr:  node tests/scripts_init.test.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let fail = 0;

// 1) Sintaxe
blocks.forEach((b, i) => {
  try { new Function(b); } catch (e) { fail++; console.log(`FAIL  bloco ${i + 1}: erro de sintaxe — ${e.message}`); }
});

// 2) Referências diretas no 1.º bloco a funções que só existem nos blocos seguintes
const decl = src => new Set([...src.matchAll(/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
const noPrimeiro = decl(blocks[0] || '');
const depois = new Set();
blocks.slice(1).forEach(b => decl(b).forEach(f => { if (!noPrimeiro.has(f)) depois.add(f); }));
const re = /addEventListener\(\s*['"][^'"]+['"]\s*,\s*([A-Za-z_$][\w$]*)\s*[,)]/g;
for (const m of (blocks[0] || '').matchAll(re)) {
  if (depois.has(m[1])) { fail++; console.log(`FAIL  1.º bloco liga diretamente "${m[1]}", que só é definido num bloco seguinte — use () => ${m[1]}()`); }
}

console.log(fail ? `\n${fail} problema(s) no arranque dos scripts.` : `OK  ${blocks.length} blocos <script> com sintaxe válida e sem referências antecipadas.`);
if (fail > 0) process.exitCode = 1;
