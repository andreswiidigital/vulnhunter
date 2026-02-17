# 🚀 Deploy Visual Guide - Vercel

## Passo a Passo Completo com Screenshots

### 📋 Pré-requisitos

- [ ] Conta no GitHub (para hospedar o código)
- [ ] Conta na Vercel (grátis em vercel.com/signup)
- [ ] Este projeto (vulnhunter)

---

## Método 1: Deploy via GitHub (Recomendado)

### 1️⃣ Suba o Código para o GitHub

```bash
# No diretório vulnhunter/
git init
git add .
git commit -m "Initial commit: VulnHunter v1.0"

# Crie um repositório no GitHub primeiro, depois:
git remote add origin https://github.com/seu-usuario/vulnhunter.git
git branch -M main
git push -u origin main
```

### 2️⃣ Conecte com a Vercel

1. Acesse: https://vercel.com
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Selecione seu repositório **vulnhunter**
5. Clique em **"Import"**

### 3️⃣ Configure o Projeto

**Framework Preset**: Next.js (detectado automaticamente)
**Root Directory**: ./
**Build Command**: `npm run build`
**Output Directory**: .next
**Install Command**: `npm install`

✅ Deixe tudo como está (padrão)

### 4️⃣ NÃO FAÇA DEPLOY AINDA!

⚠️ Antes de clicar em "Deploy", precisamos configurar o banco de dados.

Clique em **"Cancel"** por enquanto.

---

## 💾 Configurar Banco de Dados Postgres

### 1️⃣ Criar Postgres na Vercel

1. No dashboard da Vercel, vá para seu projeto
2. Clique na aba **"Storage"**
3. Clique em **"Create Database"**
4. Selecione **"Postgres"**
5. Configure:
   - **Database Name**: `vulnhunter`
   - **Region**: `us-east-1` (ou mais próxima de você)
6. Clique em **"Create"**

### 2️⃣ Conectar ao Projeto

1. Após criar, clique em **"Connect Project"**
2. Selecione seu projeto **vulnhunter**
3. As variáveis de ambiente serão adicionadas automaticamente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - Etc.

✅ Pronto! Banco configurado.

---

## 🔧 Executar Migrations

### Opção A: Via Vercel CLI (Local)

```bash
# Instale Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Link ao projeto
vercel link

# Puxe as variáveis de ambiente
vercel env pull .env.local

# Execute as migrations
npm run db:push
```

### Opção B: Via Vercel Dashboard

1. Vá em **Settings** → **Functions**
2. Em **Build Command**, temporariamente adicione:
   ```
   npm install && npm run db:push && npm run build
   ```
3. Faça um novo deploy
4. Depois, volte o Build Command para apenas: `npm run build`

### Opção C: Via Script SQL Direto

1. No Vercel, vá em **Storage** → Seu banco → **Query**
2. Cole o conteúdo de `init.sql`
3. Execute

---

## 🎯 Fazer o Deploy

### Método Fácil

1. Volte para a aba **"Deployments"**
2. Clique em **"Redeploy"**
3. Aguarde o build (1-2 minutos)
4. ✅ Deploy concluído!

### Seu App Está no Ar!

```
https://seu-projeto.vercel.app
```

---

## 🧪 Testar a Aplicação

### 1. Acesse sua URL

```
https://seu-projeto.vercel.app
```

### 2. Faça um Scan de Teste

Use um alvo seguro:

```
https://juice-shop.herokuapp.com
```

### 3. Veja os Resultados

Aguarde 10-30 segundos para o scan completar.

---

## Método 2: Deploy Direto (Sem GitHub)

### Via Vercel CLI

```bash
# No diretório vulnhunter/

# Instale Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy!
vercel

# Siga os prompts:
# - Set up and deploy? Yes
# - Which scope? (Sua conta)
# - Link to existing project? No
# - What's your project's name? vulnhunter
# - In which directory is your code located? ./
# - Want to modify settings? No

# Deploy em produção
vercel --prod
```

### Depois Configure o Banco

Siga os mesmos passos da seção "💾 Configurar Banco de Dados Postgres" acima.

---

## 🔍 Verificar se Está Funcionando

### Checklist

- [ ] Site abre normalmente
- [ ] Consegue digitar uma URL
- [ ] Scan executa sem erros
- [ ] Vulnerabilidades aparecem (se houver)
- [ ] Exploits executam

### Debug

Se algo não funcionar:

1. **Verifique os logs**:
   ```bash
   vercel logs
   ```

2. **Variáveis de ambiente**:
   - Vá em **Settings** → **Environment Variables**
   - Verifique se `POSTGRES_URL` está definida

3. **Banco de dados**:
   - Vá em **Storage** → Seu banco
   - Verifique se as tabelas existem (scans, vulnerabilities, exploits)

---

## 🎨 Customizar Domínio (Opcional)

### Adicionar Domínio Próprio

1. Vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio: `vulnhunter.seusite.com`
4. Configure o DNS conforme instruído:
   ```
   CNAME vulnhunter cname.vercel-dns.com
   ```
5. Aguarde propagação (até 48h)

---

## 🔒 Configurar HTTPS (Automático)

✅ A Vercel já configura SSL automaticamente!

Seu site já está em HTTPS:
```
https://seu-projeto.vercel.app
```

---

## 📊 Monitoramento

### Analytics (Opcional)

1. Vá em **Analytics**
2. Habilite **Web Analytics**
3. Veja métricas de:
   - Page views
   - Unique visitors
   - Performance

### Logs em Tempo Real

```bash
# Via CLI
vercel logs --follow

# Ou no dashboard:
# Deployments → Seu deploy → Runtime Logs
```

---

## 🚨 Troubleshooting

### ❌ Erro: "Build failed"

**Causa**: Erro no código ou dependências

**Solução**:
```bash
# Teste localmente primeiro
npm run build

# Se funcionar local, limpe cache na Vercel
# Settings → General → Clear Build Cache
```

### ❌ Erro: "Database connection failed"

**Causa**: Banco não configurado ou migrations não executadas

**Solução**:
1. Verifique se POSTGRES_URL está nas variáveis
2. Execute: `npm run db:push`
3. Redeploy

### ❌ Scan não funciona

**Causa**: Timeout ou target inacessível

**Solução**:
1. Teste com DVWA local: `http://host.docker.internal`
2. Ou use: `https://juice-shop.herokuapp.com`

### ❌ 500 Internal Server Error

**Causa**: Erro no código ou banco

**Solução**:
```bash
# Veja os logs
vercel logs

# Procure por erros específicos
```

---

## 🔄 Atualizações Futuras

### Fazer Update do Código

```bash
# Faça suas mudanças
git add .
git commit -m "Update: Nova feature"
git push

# A Vercel faz deploy automático!
```

### Rollback

Se algo der errado:

1. Vá em **Deployments**
2. Encontre o deploy anterior funcionando
3. Clique nos 3 pontos → **"Promote to Production"**

---

## 💡 Dicas Pro

### 1. Preview Deployments

Cada branch gera um preview:
```bash
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade
# Vercel cria: vulnhunter-git-feature-nova-funcionalidade.vercel.app
```

### 2. Environment Variables por Ambiente

Configure diferentes valores para:
- **Production**: Produção
- **Preview**: Branches
- **Development**: Local

### 3. Proteção de Branch

Em **Settings** → **Git**:
- Habilite **"Protected Branches"**
- Requer aprovação para deploy em main

---

## 📞 Suporte Vercel

- 📚 Docs: https://vercel.com/docs
- 💬 Discord: https://vercel.com/discord
- 🐛 Status: https://vercel-status.com

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Site no ar e acessível
- [ ] Banco de dados conectado
- [ ] Migrations executadas
- [ ] Scan de teste funciona
- [ ] Exploits executam
- [ ] Logs sem erros críticos
- [ ] HTTPS ativo
- [ ] Domínio configurado (opcional)

---

## 🎉 Parabéns!

Seu VulnHunter está no ar! 🚀

```
URL: https://seu-projeto.vercel.app
Status: ✅ Online
Database: ✅ Connected
SSL: ✅ Active
```

Agora você tem um **scanner de vulnerabilidades profissional** rodando em produção!

---

## 📚 Próximos Passos

1. ✅ Teste com alvos autorizados
2. ✅ Compartilhe com a equipe
3. ✅ Adicione novos exploits
4. ✅ Customize a UI
5. ✅ Implemente autenticação

---

<div align="center">

**Happy Hacking! 🎯**

[Voltar ao INDEX](INDEX.md) | [Troubleshooting](README.md#troubleshooting)

</div>
