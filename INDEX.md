# 🎯 VulnHunter - Projeto Completo

## 📦 O que você tem aqui?

Um **sistema completo de scanning e exploração de vulnerabilidades** pronto para deploy na Vercel com 1 clique!

### ✨ Características

- ✅ **Next.js 14** com App Router
- ✅ **TypeScript** totalmente tipado
- ✅ **Vercel Postgres** integrado
- ✅ **Exploits funcionais** (IDOR, SQL Injection, Registration Bypass)
- ✅ **UI profissional** com TailwindCSS
- ✅ **Logs em tempo real**
- ✅ **Pronto para produção**

---

## 🚀 Início Rápido (3 minutos)

### Opção 1: Deploy na Vercel (Mais Fácil)

1. **Crie conta na Vercel**: https://vercel.com/signup

2. **Faça upload deste projeto**:
   ```bash
   cd vulnhunter
   npx vercel
   ```

3. **Configure o banco**:
   - No painel Vercel: **Storage** → **Create** → **Postgres**
   - Nome: `vulnhunter`
   - As variáveis serão configuradas automaticamente

4. **Execute migrations**:
   ```bash
   npm run db:push
   ```

5. **Pronto!** Acesse: `https://seu-projeto.vercel.app`

### Opção 2: Rodar Localmente

```bash
# 1. Entre no diretório
cd vulnhunter

# 2. Execute o setup automático
chmod +x setup.sh
./setup.sh

# 3. OU faça manualmente:
npm install
cp .env.example .env
# Edite .env com sua POSTGRES_URL
npm run db:push
npm run dev

# 4. Acesse: http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
vulnhunter/
├── 📄 README.md              # Documentação principal
├── 📄 QUICKSTART.md          # Guia de início rápido
├── 📄 TESTING.md             # Como testar com DVWA
├── 📄 SECURITY.md            # Política de segurança
├── 📄 CONTRIBUTING.md        # Como contribuir
├── 📄 LICENSE                # Licença MIT
│
├── 🔧 setup.sh              # Script de instalação automática
├── 🔧 package.json          # Dependências
├── 🔧 next.config.js        # Configuração Next.js
├── 🔧 tailwind.config.js    # Configuração Tailwind
├── 🔧 tsconfig.json         # Configuração TypeScript
├── 🔧 drizzle.config.ts     # Configuração do banco
├── 🔧 vercel.json           # Configuração Vercel
│
├── 📂 src/
│   ├── 📂 app/
│   │   ├── page.tsx                    # 🏠 Home page
│   │   ├── layout.tsx                  # Layout principal
│   │   ├── globals.css                 # Estilos globais
│   │   │
│   │   ├── 📂 scan/[scanId]/
│   │   │   └── page.tsx               # 📊 Página de resultados
│   │   │
│   │   └── 📂 api/
│   │       ├── 📂 scans/
│   │       │   ├── route.ts           # POST /api/scans (criar scan)
│   │       │   └── [scanId]/
│   │       │       └── route.ts       # GET /api/scans/:id (obter scan)
│   │       │
│   │       └── 📂 exploits/
│   │           └── execute/
│   │               └── route.ts       # POST /api/exploits/execute
│   │
│   ├── 📂 components/
│   │   └── ExploitCard.tsx            # 🎯 Card de exploração
│   │
│   ├── 📂 lib/
│   │   ├── scanner.ts                 # 🔍 Scanner de vulnerabilidades
│   │   │
│   │   ├── 📂 db/
│   │   │   ├── index.ts              # Conexão do banco
│   │   │   └── schema.ts             # Schema Drizzle ORM
│   │   │
│   │   └── 📂 exploits/
│   │       ├── base.ts               # ⚡ Classe base abstrata
│   │       ├── factory.ts            # 🏭 Factory de exploits
│   │       ├── registration.ts       # 👤 Exploit de cadastro
│   │       ├── idor.ts              # 🔓 Exploit de IDOR
│   │       └── sqli.ts              # 💉 Exploit de SQL Injection
│   │
│   └── 📂 types/
│       └── index.ts                  # TypeScript types
│
└── 📂 .env (criar)                   # Variáveis de ambiente
```

---

## 🎯 Funcionalidades Implementadas

### 1. Scanner Automático
- ✅ Descobre endpoints automaticamente
- ✅ Detecta IDOR, SQL Injection, falhas de autenticação
- ✅ Classifica por severidade (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Salva resultados no banco de dados

### 2. Exploits Funcionais

#### 📤 Registration Exploit
- Testa 10+ variações de payloads
- Tenta privilege escalation (role: admin)
- Faz login automático após criar conta
- Verifica acesso a áreas restritas

#### 🔓 IDOR Exploit
- Varre IDs sequenciais (1-30, 1000-1020, -10 a -1)
- Detecta dados sensíveis (email, cpf, token, etc.)
- Testa modificações (PUT, PATCH, DELETE)
- Gera evidências completas

#### 💉 SQL Injection Exploit
- 8 payloads diferentes (auth bypass, UNION, time-based)
- Detecta vulnerabilidades por tempo de resposta
- Identifica mensagens de erro SQL
- Gera comandos cURL para reprodução

### 3. Interface Profissional
- Dashboard com estatísticas em tempo real
- Cards de exploração interativos
- Terminal com logs coloridos
- Exportação de evidências em JSON
- Design dark mode responsivo

### 4. Banco de Dados
- Schema completo com Drizzle ORM
- Tabelas: `scans`, `vulnerabilities`, `exploits`
- Relacionamentos corretos
- Migrations automáticas

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript 5 |
| **Banco de Dados** | PostgreSQL (Vercel Postgres) |
| **ORM** | Drizzle ORM |
| **Estilização** | TailwindCSS 3 |
| **UI Components** | Lucide Icons |
| **Notificações** | React Hot Toast |
| **Deploy** | Vercel |

---

## 📚 Documentação

### Para Começar
1. **README.md** - Visão geral completa
2. **QUICKSTART.md** - Setup em 3 minutos
3. **TESTING.md** - Como testar com DVWA

### Para Desenvolvedores
4. **CONTRIBUTING.md** - Como contribuir
5. **SECURITY.md** - Política de segurança
6. Código-fonte comentado

---

## 🧪 Como Testar

### 1. Com DVWA (Recomendado)

```bash
# Instale DVWA via Docker
docker run -d -p 80:80 vulnerables/web-dvwa

# Configure:
# - Acesse: http://localhost
# - Login: admin / password
# - Setup → Create Database
# - DVWA Security → Low

# No VulnHunter, escaneie:
http://localhost
```

### 2. Com Juice Shop

```bash
docker run -d -p 3001:3000 bkimminich/juice-shop
# Escaneie: http://localhost:3001
```

### 3. Vulnerabilidades Esperadas

Em DVWA (Security: Low):

| Vulnerabilidade | Status | Resultados Esperados |
|----------------|--------|---------------------|
| SQL Injection | ✅ Detecta | 2-4 payloads funcionam |
| IDOR | ✅ Detecta | 10-20 recursos acessíveis |
| Auth Bypass | ✅ Detecta | Login sem credenciais |
| Registration | ⚠️ Limitado | DVWA não tem registro |

---

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Lint do código

npm run db:push      # Aplica schema no banco
npm run db:studio    # Abre Drizzle Studio (GUI)
npm run db:generate  # Gera migrations

npm run type-check   # Verifica tipos TypeScript
npm run clean        # Limpa cache
npm run deploy       # Deploy na Vercel
```

---

## ⚠️ Importante: Uso Legal

### ✅ USE PARA:
- Testar seus próprios sistemas
- Pentesting autorizado (com permissão por escrito)
- Ambientes de laboratório (DVWA, Juice Shop)
- Programas de bug bounty (seguindo as regras)

### ❌ NÃO USE PARA:
- Testes não autorizados
- Invasão de sistemas
- Qualquer atividade ilegal
- Violação de termos de serviço

**Uso indevido é CRIME e pode resultar em prisão.**

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"
```bash
# Verifique a POSTGRES_URL
echo $POSTGRES_URL

# Execute migrations novamente
npm run db:push
```

### Erro: "Module not found"
```bash
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

### Scan não encontra vulnerabilidades
- Sistema pode estar protegido (WAF)
- Tente com DVWA no nível "Low"
- Verifique se o alvo está acessível

---

## 📈 Próximos Passos

### Para Usuários
1. ✅ Faça o setup
2. ✅ Teste com DVWA
3. ✅ Execute exploits
4. ✅ Analise resultados
5. ✅ Exporte evidências

### Para Desenvolvedores
1. Adicione novos exploits (XSS, CSRF, etc.)
2. Melhore a detecção de vulnerabilidades
3. Adicione testes automatizados
4. Implemente autenticação de usuários
5. Adicione rate limiting

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovoExploit`)
3. Commit (`git commit -m 'Add: Novo exploit'`)
4. Push (`git push origin feature/NovoExploit`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

---

## 📄 Licença

MIT License - Apenas para fins educacionais

Veja [LICENSE](LICENSE) para detalhes.

---

## 🌟 Features Futuras

- [ ] Autenticação de usuários
- [ ] Histórico de scans
- [ ] Relatórios em PDF
- [ ] Exploits de XSS, CSRF, XXE
- [ ] Integração com Burp Suite
- [ ] API pública
- [ ] Modo headless (CLI)
- [ ] Suporte a múltiplos alvos
- [ ] Dashboard analytics

---

## 📞 Suporte

- 📧 Email: support@vulnhunter.example.com
- 💬 Discord: [Link aqui]
- 🐛 Issues: GitHub Issues
- 📖 Docs: Leia os arquivos .md

---

## ✨ Créditos

Desenvolvido para fins educacionais e de pesquisa em segurança.

**Ferramentas utilizadas:**
- Next.js
- Drizzle ORM
- TailwindCSS
- Vercel

---

## 🎉 Pronto para Começar!

```bash
# Execute o setup
./setup.sh

# Ou manualmente
npm install
npm run dev

# Acesse
http://localhost:3000
```

**Boa caçada de vulnerabilidades! 🎯**

---

<div align="center">

**[⬆ Voltar ao Topo](#-vulnhunter---projeto-completo)**

</div>
