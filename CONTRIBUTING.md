# Contributing to VulnHunter

Obrigado por considerar contribuir com o VulnHunter! 🎯

## Formas de Contribuir

### 🐛 Reportar Bugs

Se você encontrou um bug:

1. Verifique se já não foi reportado nas [Issues](../../issues)
2. Crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Versão do Node.js, navegador, etc.

### 💡 Sugerir Features

Tem uma ideia para melhorar o VulnHunter?

1. Abra uma issue com tag `enhancement`
2. Descreva a feature proposta
3. Explique o caso de uso
4. Discuta a implementação

### 🔧 Adicionar Exploits

Quer adicionar um novo tipo de exploit?

1. Crie uma classe estendendo `BaseExploit`
2. Implemente os métodos obrigatórios
3. Adicione testes
4. Documente o exploit

Exemplo:

```typescript
// src/lib/exploits/xss.ts
import { BaseExploit, ExploitResult } from './base';

export class XSSExploit extends BaseExploit {
  getPayloads() {
    return [
      { name: 'basic_xss', payload: '<script>alert(1)</script>' },
      // ... mais payloads
    ];
  }

  async execute(): Promise<ExploitResult> {
    // Sua implementação aqui
  }
}
```

Registre no factory:

```typescript
// src/lib/exploits/factory.ts
import { XSSExploit } from './xss';

export class ExploitFactory {
  static create(type: string, targetUrl: string, vulnerability: any) {
    switch (type) {
      // ... casos existentes
      case 'xss':
        return new XSSExploit(targetUrl, vulnerability);
      // ...
    }
  }
}
```

## Desenvolvimento

### Setup

```bash
# Clone o repo
git clone https://github.com/seu-usuario/vulnhunter.git
cd vulnhunter

# Instale dependências
npm install

# Configure .env
cp .env.example .env
# Edite .env com suas credenciais

# Execute migrations
npm run db:push

# Inicie dev server
npm run dev
```

### Estrutura do Código

```
src/
├── app/              # Next.js pages e API routes
│   ├── page.tsx      # Home page
│   ├── scan/         # Scan results page
│   └── api/          # API endpoints
├── components/       # React components
├── lib/
│   ├── db/          # Database schema e config
│   ├── exploits/    # Exploit classes
│   └── scanner.ts   # Vulnerability scanner
└── types/           # TypeScript types
```

### Padrão de Código

- **TypeScript**: Sempre tipar corretamente
- **ESLint**: Seguir as regras do projeto
- **Comentários**: Código complexo deve ser comentado
- **Nomes**: Usar nomes descritivos em inglês

```typescript
// ✅ BOM
async function executeExploit(vulnerabilityId: string): Promise<ExploitResult> {
  // Implementation
}

// ❌ RUIM
async function doIt(id: string): Promise<any> {
  // Implementation
}
```

### Commits

Use commits semânticos:

```
feat: Adiciona exploit de XSS
fix: Corrige erro no scanner de IDOR
docs: Atualiza README com novos exemplos
style: Formata código com Prettier
refactor: Refatora ExploitCard component
test: Adiciona testes para SQLi exploit
chore: Atualiza dependências
```

## Pull Requests

### Antes de Enviar

- [ ] Código está funcionando localmente
- [ ] Testes passam (se houver)
- [ ] Documentação atualizada
- [ ] Commits estão limpos
- [ ] Código segue o style guide

### Template de PR

```markdown
## Descrição
[Descreva suas mudanças]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Step one
2. Step two
3. Step three

## Screenshots (se aplicável)
[Cole screenshots aqui]

## Checklist
- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Commits limpos
- [ ] Passou no CI/CD (se houver)
```

### Review Process

1. Crie o PR
2. Aguarde review (pode levar até 7 dias)
3. Endereçe os comentários
4. PR será mergado quando aprovado

## Adicionando Novos Scanners

Para adicionar detecção de novas vulnerabilidades:

```typescript
// src/lib/scanner.ts

private async checkXSSVulns() {
  const vulns: ScanResult['vulnerabilities'] = [];
  
  // Sua lógica de detecção
  const testPayload = '<script>alert(1)</script>';
  // ...

  if (isVulnerable) {
    vulns.push({
      type: 'xss',
      endpoint: '/vulnerable-page',
      method: 'GET',
      severity: 'HIGH',
      description: 'XSS vulnerability detected',
    });
  }

  return vulns;
}
```

Chame no método `scan()`:

```typescript
async scan(): Promise<ScanResult> {
  // ... código existente
  const xssVulns = await this.checkXSSVulns();
  vulnerabilities.push(...xssVulns);
  // ...
}
```

## Melhorando a UI

### Adicionando Componentes

```typescript
// src/components/NovoComponente.tsx
'use client';

import { useState } from 'react';
import { Icon } from 'lucide-react';

export default function NovoComponente({ prop }: Props) {
  return (
    <div className="card">
      {/* Seu código aqui */}
    </div>
  );
}
```

### Classes CSS Disponíveis

```css
/* Botões */
.btn-primary    /* Verde neon */
.btn-secondary  /* Cinza */
.btn-danger     /* Vermelho */

/* Cards */
.card           /* Card padrão */
.terminal       /* Terminal style */

/* Badges */
.badge-critical /* Vermelho */
.badge-high     /* Laranja */
.badge-medium   /* Amarelo */
.badge-low      /* Azul */

/* Inputs */
.input          /* Input padrão */
```

## Testes

### Rodando Testes (quando implementados)

```bash
npm test                  # Todos os testes
npm test -- --watch       # Watch mode
npm test -- scanner.test  # Teste específico
```

### Escrevendo Testes

```typescript
// __tests__/exploits/registration.test.ts
import { RegistrationExploit } from '@/lib/exploits/registration';

describe('RegistrationExploit', () => {
  it('should create accounts successfully', async () => {
    const exploit = new RegistrationExploit(
      'http://example.com',
      { /* vulnerability data */ }
    );

    const result = await exploit.execute();
    
    expect(result.success).toBe(true);
    expect(result.exploits.length).toBeGreaterThan(0);
  });
});
```

## Documentação

### Atualizando Docs

Mantenha atualizado:

- **README.md**: Features principais
- **QUICKSTART.md**: Setup rápido
- **TESTING.md**: Ambientes de teste
- **Código**: JSDoc comments

Exemplo de JSDoc:

```typescript
/**
 * Executa exploit de SQL Injection
 * @param vulnerabilityId ID da vulnerabilidade
 * @returns Resultado da execução com logs e evidências
 * @throws Error se vulnerabilidade não for encontrada
 */
async function executeSQLInjection(vulnerabilityId: string): Promise<ExploitResult> {
  // ...
}
```

## Code of Conduct

### Seja Respeitoso

- ✅ Feedback construtivo
- ✅ Abertura a diferentes opiniões
- ✅ Foco no que é melhor para a comunidade
- ❌ Linguagem ofensiva
- ❌ Ataques pessoais
- ❌ Trolling ou comportamento não profissional

### Segurança em Primeiro Lugar

- Nunca commit credenciais ou secrets
- Não incentive uso ilegal
- Relate vulnerabilidades de forma responsável
- Siga a [política de segurança](SECURITY.md)

## Perguntas?

- 💬 Abra uma [Discussion](../../discussions)
- 📧 Email: vulnhunter@example.com
- 🐛 Bug? Crie uma [Issue](../../issues)

## Agradecimentos

Contribuidores são creditados no [README.md](README.md#contributors) ⭐

---

**Obrigado por ajudar a tornar o VulnHunter melhor!** 🚀
