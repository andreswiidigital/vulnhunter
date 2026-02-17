# 🎯 VulnHunter - Advanced Vulnerability Scanner & Exploitation Platform

<div align="center">

![VulnHunter Logo](https://img.shields.io/badge/VulnHunter-v1.0-00ff41?style=for-the-badge&logo=shield&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-Educational-yellow?style=for-the-badge)

**Plataforma profissional de pentesting que mapeia, testa e explora vulnerabilidades em aplicações web com ataques simulados em tempo real.**

[Deploy na Vercel](#-deploy-na-vercel-1-clique) • [Funcionalidades](#-funcionalidades) • [Como Usar](#-como-usar)

</div>

---

## 🚀 Deploy na Vercel (1 Clique)

### Passo 1: Clique no botão abaixo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/vulnhunter)

### Passo 2: Configure o banco de dados Postgres

No painel da Vercel, após o deploy:

1. Vá em **Storage** → **Create Database** → **Postgres**
2. Crie um banco com o nome `vulnhunter`
3. As variáveis de ambiente serão configuradas automaticamente

### Passo 3: Execute as migrations

No terminal da Vercel ou localmente:

```bash
npm run db:push
```

### Passo 4: Acesse sua aplicação!

```
https://seu-app.vercel.app
```

---

## 📦 Deploy Manual (Alternativo)

Se preferir fazer deploy manual:

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/vulnhunter.git
cd vulnhunter
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
POSTGRES_URL="sua-connection-string-aqui"
```

**Onde conseguir o Postgres?**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recomendado)
- [Supabase](https://supabase.com/) (Grátis)
- [Neon](https://neon.tech/) (Grátis)

### 4. Execute as migrations

```bash
npm run db:push
```

### 5. Rode localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 6. Deploy na Vercel

```bash
vercel
```

---

## ✨ Funcionalidades

### 🔍 Scanner Automático
- Detecta automaticamente vulnerabilidades comuns
- Mapeia endpoints e APIs
- Identifica IDOR, SQL Injection, falhas de autenticação

### ⚡ Exploits em Tempo Real
- **Registration Bypass**: Testa criação de contas sem validação
- **IDOR**: Varre recursos por IDs sequenciais
- **SQL Injection**: Testa payloads clássicos de SQLi
- Logs em tempo real durante a execução

### 📊 Relatórios Detalhados
- Dashboard com estatísticas
- Evidências de cada exploit
- Comandos cURL para reprodução
- Exportação de resultados em JSON

### 🎯 Interface Profissional
- Design dark mode otimizado
- Animações fluidas
- Responsivo (mobile-friendly)
- Terminal integrado com logs

---

## 🎮 Como Usar

### 1. Acesse a página inicial

Insira a URL do alvo:
```
https://exemplo.com
```

**⚠️ IMPORTANTE**: Teste apenas em sistemas com permissão explícita!

### 2. Aguarde o scan completar

O scanner vai:
- Descobrir endpoints automaticamente
- Testar vulnerabilidades comuns
- Classificar por severidade (CRITICAL, HIGH, MEDIUM, LOW)

### 3. Execute os exploits

Para cada vulnerabilidade encontrada:
- Clique em "Run Exploit"
- Acompanhe os logs em tempo real
- Visualize os resultados

### 4. Exporte as evidências

Baixe relatórios completos com:
- Payloads utilizados
- Respostas do servidor
- Comandos cURL
- Screenshots (se disponível)

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Vercel Postgres)
- **ORM**: Drizzle ORM
- **Estilização**: TailwindCSS
- **UI**: Lucide Icons, Framer Motion
- **Requisições**: Fetch API nativa

---

## 📁 Estrutura do Projeto

```
vulnhunter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home page
│   │   ├── scan/[scanId]/     # Scan results page
│   │   └── api/               # API Routes
│   │       ├── scans/         # Scan endpoints
│   │       └── exploits/      # Exploit execution
│   ├── components/            # React Components
│   │   └── ExploitCard.tsx   # Card de exploração
│   └── lib/
│       ├── db/                # Database setup
│       ├── exploits/          # Exploit classes
│       │   ├── base.ts       # Base class
│       │   ├── registration.ts
│       │   ├── idor.ts
│       │   └── sqli.ts
│       └── scanner.ts         # Vulnerability scanner
├── package.json
├── next.config.js
└── README.md
```

---

## 🔧 Desenvolvimento Local

### Requisitos

- Node.js 18+
- PostgreSQL (ou use Vercel Postgres)

### Scripts disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run db:push      # Aplica schema no banco
npm run db:studio    # Abre Drizzle Studio (GUI do banco)
```

---

## 🎯 Vulnerabilidades Suportadas

### ✅ Implementadas

| Tipo | Descrição | Severidade |
|------|-----------|------------|
| **Registration Bypass** | Criação de contas sem validação, privilege escalation | HIGH |
| **IDOR** | Acesso a recursos de outros usuários por ID | CRITICAL |
| **SQL Injection** | Injeção de código SQL em inputs | CRITICAL |

### 🚧 Em Desenvolvimento

- File Upload Bypass
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- XXE (XML External Entity)
- SSRF (Server-Side Request Forgery)
- Rate Limiting Issues

---

## 📝 Exemplos de Uso

### Testando um site vulnerável

Use ambientes de teste como:
- [DVWA](http://www.dvwa.co.uk/) - Damn Vulnerable Web Application
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [HackTheBox](https://www.hackthebox.com/)

```bash
# Exemplo: DVWA local
URL: http://localhost/dvwa
```

### Criando exploits customizados

Veja o código dos exploits existentes em `src/lib/exploits/` e crie novos:

```typescript
import { BaseExploit } from './base';

export class MyCustomExploit extends BaseExploit {
  async execute() {
    // Sua lógica aqui
  }
}
```

---

## ⚠️ Aviso Legal

**IMPORTANTE**: Esta ferramenta é para fins educacionais e testes autorizados apenas.

- ✅ **PERMITIDO**: Testes em sistemas próprios ou com autorização explícita
- ❌ **PROIBIDO**: Testes não autorizados, invasões, danos

**Uso indevido pode resultar em consequências legais graves.**

O desenvolvedor não se responsabiliza pelo uso inadequado desta ferramenta.

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovoExploit`)
3. Commit suas mudanças (`git commit -m 'Add: Novo exploit'`)
4. Push para a branch (`git push origin feature/NovoExploit`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é apenas para fins educacionais.

**Não use para atividades ilegais.**

---

## 🔗 Links Úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

<div align="center">

**Feito com 💚 por pesquisadores de segurança**

[⬆ Voltar ao topo](#-vulnhunter---advanced-vulnerability-scanner--exploitation-platform)

</div>
