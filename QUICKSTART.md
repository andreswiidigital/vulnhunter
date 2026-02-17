# 🚀 Quick Start - VulnHunter

## Deploy em 3 Minutos

### Opção 1: Deploy Automático na Vercel (Recomendado)

1. **Crie conta na Vercel** (se não tiver): https://vercel.com/signup

2. **Faça upload do projeto**:
   ```bash
   # Se você tem o código localmente
   cd vulnhunter
   npx vercel
   ```

3. **Configure o banco de dados**:
   - No painel da Vercel, vá em **Storage**
   - Clique em **Create Database**
   - Escolha **Postgres**
   - Nome: `vulnhunter`
   - Região: `us-east-1` (ou mais próxima)
   - Clique em **Create**

4. **Execute as migrations**:
   - No painel da Vercel, vá na aba **Settings** → **Functions**
   - Ou rode localmente: `npm run db:push`

5. **Pronto! Acesse**: `https://seu-projeto.vercel.app`

---

### Opção 2: Rodar Localmente (Desenvolvimento)

#### Requisitos
- Node.js 18+ instalado
- Conta no Vercel (para usar o Postgres gratuito)

#### Passos

1. **Clone/extraia o projeto**:
   ```bash
   cd vulnhunter
   ```

2. **Instale dependências**:
   ```bash
   npm install
   ```

3. **Configure o banco de dados**:
   
   **Opção A - Vercel Postgres (Grátis)**:
   - Crie projeto na Vercel: https://vercel.com
   - Vá em Storage → Create → Postgres
   - Copie a `POSTGRES_URL`
   
   **Opção B - Supabase (Grátis)**:
   - Crie projeto: https://supabase.com
   - Vá em Settings → Database
   - Copie a connection string
   
   **Opção C - Postgres Local**:
   ```bash
   # Docker
   docker run -d \
     --name vulnhunter-db \
     -e POSTGRES_PASSWORD=vulnhunter123 \
     -e POSTGRES_DB=vulnhunter \
     -p 5432:5432 \
     postgres:15
   ```

4. **Crie arquivo .env**:
   ```env
   POSTGRES_URL="postgresql://user:password@host:5432/vulnhunter"
   ```

5. **Execute migrations**:
   ```bash
   npm run db:push
   ```

6. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

7. **Acesse**: http://localhost:3000

---

## Primeiro Uso

### 1. Teste em ambiente seguro

Use um site de testes:
- DVWA: http://dvwa.local (ou instale: https://github.com/digininja/DVWA)
- Juice Shop: https://juice-shop.herokuapp.com
- Seu próprio site de testes

### 2. Execute um scan

1. Cole a URL do alvo
2. Clique em "Iniciar Scan"
3. Aguarde a detecção (15-30 segundos)

### 3. Explore as vulnerabilidades

Para cada vulnerabilidade encontrada:
- Clique em "Run Exploit"
- Veja logs em tempo real
- Analise os resultados
- Exporte evidências

---

## Troubleshooting

### ❌ Erro: "Database connection failed"

**Solução**:
```bash
# Verifique se a POSTGRES_URL está correta
echo $POSTGRES_URL

# Teste a conexão
psql $POSTGRES_URL

# Execute as migrations novamente
npm run db:push
```

### ❌ Erro: "Module not found"

**Solução**:
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### ❌ Scan não encontra vulnerabilidades

**Possíveis causas**:
1. Site está protegido (WAF, rate limiting)
2. Endpoints não são padrão
3. Site requer autenticação

**Teste com DVWA**:
```bash
# Docker DVWA
docker run -d -p 80:80 vulnerables/web-dvwa

# Acesse: http://localhost
# Faça scan em: http://localhost/vulnerabilities/sqli/
```

### ❌ Deploy falhou na Vercel

**Checklist**:
- [ ] Node.js version >= 18 no package.json
- [ ] Postgres configurado no painel
- [ ] Variáveis de ambiente setadas
- [ ] Build logs não mostram erros

---

## Próximos Passos

### 🎯 Para Desenvolvedores

1. **Adicione novos exploits**:
   - Veja `src/lib/exploits/registration.ts` como exemplo
   - Crie sua classe estendendo `BaseExploit`
   - Registre no `factory.ts`

2. **Customize o scanner**:
   - Edite `src/lib/scanner.ts`
   - Adicione novos checks de vulnerabilidades

3. **Melhore a UI**:
   - Components em `src/components/`
   - Estilos em `src/app/globals.css`

### 🛡️ Para Pentesters

1. **Use em auditorias reais**:
   - Sempre com autorização
   - Documente tudo
   - Exporte evidências

2. **Crie payloads customizados**:
   - Edite os arrays `getPayloads()` nos exploits
   - Adicione casos específicos da aplicação

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor local
npm run build            # Build de produção
npm run start            # Rodar produção localmente

# Banco de dados
npm run db:push          # Aplicar schema
npm run db:studio        # GUI do banco (Drizzle Studio)

# Deploy
vercel                   # Deploy na Vercel
vercel --prod            # Deploy direto em produção
vercel logs              # Ver logs
```

---

## Links Importantes

- 📚 Documentação: [README.md](./README.md)
- 🐛 Reportar bugs: GitHub Issues
- 💬 Suporte: Discord/Telegram
- 🌐 Demo: https://vulnhunter.vercel.app

---

## ⚠️ Lembrete Legal

**USE APENAS EM SISTEMAS AUTORIZADOS!**

Testes não autorizados são CRIME em qualquer jurisdição.

---

✅ **Pronto para começar!** Execute seu primeiro scan agora.
