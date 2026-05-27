# Procedimento de Backup

Os dados dos funcionários ficam **apenas no navegador** (`localStorage`). Não existe cópia automática na nuvem. **O backup é essencial e é da responsabilidade da empresa.**

---

## Frequências de backup

### 🗓️ Backup SEMANAL (mínimo obrigatório)
- **O quê:** Backup JSON (botão **💾 Backup JSON**).
- **Quando:** todas as **sextas-feiras**.
- **Nome do ficheiro:** `backup_AAAA-Www.json` (ex.: `backup_2026-W22.json`, onde `Www` é o número da semana).
- **Onde guardar:**
  ```
  D:\Legado_Aclamado\Backups_RH\Semanais\
  ```

### 🗓️ Backup MENSAL
- **O quê:** **ZIP completo** (botão **🗜️ ZIP Completo**), **encriptado** com 7-Zip + password.
- **Como encriptar:** clique direito no ZIP → 7-Zip → *Add to archive* → defina **password** e ative **Encrypt file names**.
- **Onde guardar:** disco externo + cópia off-site.

### 🗓️ Backup TRIMESTRAL
- **O quê:** arquivo **histórico imutável** (cópia que **não se altera**), guardado separadamente como registo do estado nesse trimestre.
- **Recomendação:** marcar como apenas-leitura e guardar em suporte diferente.

---

## Regra 3-2-1

- **3** cópias dos dados
- em **2** suportes diferentes (ex.: PC + disco externo)
- com **1** cópia **off-site** (fora das instalações — cofre, casa, cloud encriptada)

---

## Estrutura de pastas recomendada

```
D:\Legado_Aclamado\Backups_RH\
├── Semanais\
│   ├── backup_2026-W20.json
│   ├── backup_2026-W21.json
│   └── backup_2026-W22.json
├── Mensais\
│   ├── 2026-04_Legado_RH.7z   (encriptado)
│   └── 2026-05_Legado_RH.7z   (encriptado)
└── Trimestrais\
    └── 2026-T1_arquivo_historico.7z
```

---

## Como restaurar de backup

### A partir de Backup JSON
1. Abra a aplicação.
2. Clique em **📥 Importar**.
3. Selecione o ficheiro `backup_*.json`.
4. Confirme (⚠️ a importação **substitui** todos os dados atuais).

### A partir de ZIP
1. Extraia o ZIP (se encriptado, introduza a password no 7-Zip).
2. Localize o ficheiro `backup.json` dentro do ZIP.
3. Siga os passos de **Importar** acima com esse `backup.json`.

---

## Checklist mensal

- [ ] Backups semanais presentes (4-5 ficheiros do mês)
- [ ] ZIP mensal criado **e** encriptado
- [ ] Cópia off-site atualizada
- [ ] Teste de restauro realizado (importar num PC de teste)
- [ ] Backups antigos arquivados conforme a política de conservação

---

## Avisos

- ❌ **Nunca** envie backups por **email não encriptado** — contêm dados pessoais.
- ✅ **Verifique os restauros trimestralmente** — um backup que não restaura não vale nada.
- 🔒 Guarde as **passwords** dos ZIP encriptados em gestor de passwords seguro.
- 🧹 Lembre-se: **limpar os dados do navegador apaga tudo**. Faça backup antes de qualquer limpeza ou manutenção do PC.
