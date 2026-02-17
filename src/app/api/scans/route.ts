import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scans, vulnerabilities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const maxDuration = 60;

// ─── HTTP Helper ─────────────────────────────────────────────────
async function fetchSafe(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (VulnHunter Scanner)',
        'Accept': 'application/json, text/html, */*',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
}

async function getText(res: Response | null): Promise<string> {
  if (!res) return '';
  try { return await res.text(); } catch { return ''; }
}

async function getJson(res: Response | null): Promise<any> {
  if (!res) return null;
  try { return await res.json(); } catch { return null; }
}

// ─── 1. Crawl & Endpoint Discovery ───────────────────────────────
async function discoverEndpoints(base: string): Promise<string[]> {
  const found = new Set<string>();

  // Lista extensa de endpoints comuns
  const common = [
    // Auth
    '/login', '/logout', '/register', '/signup', '/signin',
    '/forgot-password', '/reset-password', '/verify-email',
    '/api/login', '/api/logout', '/api/register', '/api/signup',
    '/api/auth/login', '/api/auth/register', '/api/auth/logout',
    '/api/v1/login', '/api/v1/register', '/api/v1/auth',
    '/api/v2/login', '/api/v2/register',
    // Users
    '/api/users', '/api/user', '/api/users/me', '/api/profile',
    '/api/account', '/api/accounts', '/api/me',
    '/api/v1/users', '/api/v1/user', '/api/v1/profile',
    // Admin
    '/admin', '/admin/login', '/admin/dashboard', '/api/admin',
    '/api/admin/users', '/administrator', '/manage',
    // Common resources
    '/api/posts', '/api/products', '/api/orders', '/api/items',
    '/api/comments', '/api/messages', '/api/notifications',
    '/api/dashboard', '/api/settings', '/api/config',
    // Sensitive
    '/.env', '/config.json', '/api/keys', '/api/tokens',
    '/api/debug', '/api/health', '/api/status', '/api/info',
    '/phpinfo.php', '/info.php', '/test.php',
    '/backup', '/api/backup', '/dump.sql',
    // Docs
    '/api/docs', '/swagger', '/swagger.json', '/openapi.json',
    '/api-docs', '/graphql',
    // Common Next.js / frameworks
    '/_next/static', '/static', '/assets',
  ];

  // Testa todos em paralelo em lotes
  const batchSize = 20;
  for (let i = 0; i < common.length; i += batchSize) {
    const batch = common.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(path => fetchSafe(`${base}${path}`, {}, 3000).then(r => ({ path, status: r?.status })))
    );
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.status && r.value.status !== 404 && r.value.status !== 0) {
        found.add(r.value.path);
      }
    });
  }

  // Tenta descobrir via robots.txt
  const robots = await fetchSafe(`${base}/robots.txt`, {}, 3000);
  const robotsText = await getText(robots);
  const robotsPaths = robotsText.match(/(?:Allow|Disallow):\s*(\S+)/g) || [];
  robotsPaths.forEach(line => {
    const path = line.replace(/(?:Allow|Disallow):\s*/, '').trim();
    if (path && path !== '/' && path !== '*') found.add(path);
  });

  // Tenta sitemap
  const sitemap = await fetchSafe(`${base}/sitemap.xml`, {}, 3000);
  const sitemapText = await getText(sitemap);
  const sitemapUrls = sitemapText.match(/<loc>(.*?)<\/loc>/g) || [];
  sitemapUrls.forEach(loc => {
    try {
      const url = new URL(loc.replace(/<\/?loc>/g, ''));
      found.add(url.pathname);
    } catch {}
  });

  return Array.from(found);
}

// ─── 2. Registration Exploit ──────────────────────────────────────
async function checkRegistration(base: string, endpoints: string[]) {
  const vulns: any[] = [];
  const regPaths = endpoints.filter(e =>
    ['/register', '/signup', '/api/register', '/api/signup', '/api/auth/register', '/api/v1/register'].some(p => e.includes(p))
  );
  if (regPaths.length === 0) regPaths.push('/api/register', '/register', '/api/auth/register');

  for (const ep of regPaths) {
    const url = `${base}${ep}`;

    // Teste 1: Registro normal
    const ts = Date.now();
    const normalRes = await fetchSafe(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test_${ts}@evil.com`, password: 'Test1234!', name: 'Test User' }),
    });

    if (normalRes?.ok || normalRes?.status === 201) {
      vulns.push({
        type: 'registration',
        endpoint: ep,
        method: 'POST',
        severity: 'HIGH',
        description: `Endpoint de registro aberto em ${ep}: permite criação de contas sem validação ou CAPTCHA.`,
        proof: { statusCode: normalRes.status, canRegister: true },
      });

      // Teste 2: Registro com role admin
      const adminRes = await fetchSafe(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `admin_${ts}@evil.com`, password: 'Admin1234!', name: 'Admin', role: 'admin', is_admin: true, admin: true, user_type: 'administrator', permissions: ['*'] }),
      });
      if (adminRes?.ok || adminRes?.status === 201) {
        vulns.push({
          type: 'registration',
          endpoint: ep,
          method: 'POST',
          severity: 'CRITICAL',
          description: `Privilege Escalation no registro em ${ep}: aceita campos "role: admin" e "is_admin: true" — possível criar conta com privilégios de administrador.`,
          proof: { statusCode: adminRes.status, adminFieldsAccepted: true },
        });
      }

      // Teste 3: Registro duplicado (sem rate limiting)
      const dup1 = await fetchSafe(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `dup_${ts}@evil.com`, password: 'Test1234!' }) });
      const dup2 = await fetchSafe(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `dup_${ts}@evil.com`, password: 'Test1234!' }) });
      const dup3 = await fetchSafe(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `dup_${ts}@evil.com`, password: 'Test1234!' }) });
      if (dup1?.ok && dup2?.ok && dup3?.ok) {
        vulns.push({
          type: 'rate_limit',
          endpoint: ep,
          method: 'POST',
          severity: 'MEDIUM',
          description: `Sem rate limiting no registro em ${ep}: múltiplos registros aceitos em sequência rápida.`,
          proof: { attempts: 3, allSucceeded: true },
        });
      }
    }

    // Teste 4: Campos obrigatórios (mass assignment)
    const massRes = await fetchSafe(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `mass_${ts}@evil.com`, password: 'Test1234!',
        id: 1, created_at: '2020-01-01', updated_at: '2020-01-01',
        verified: true, email_verified: true, active: true,
        balance: 99999, credit: 99999,
      }),
    });
    if (massRes?.ok || massRes?.status === 201) {
      vulns.push({
        type: 'registration',
        endpoint: ep,
        method: 'POST',
        severity: 'HIGH',
        description: `Mass Assignment em ${ep}: aceita campos internos como "id", "verified", "balance" no registro.`,
        proof: { statusCode: massRes.status, massAssignment: true },
      });
    }
  }
  return vulns;
}

// ─── 3. Authentication Tests ──────────────────────────────────────
async function checkAuth(base: string, endpoints: string[]) {
  const vulns: any[] = [];
  const loginPaths = endpoints.filter(e =>
    ['/login', '/api/login', '/api/auth/login', '/api/signin', '/signin'].some(p => e.includes(p))
  );
  if (loginPaths.length === 0) loginPaths.push('/api/login', '/login', '/api/auth/login');

  for (const ep of loginPaths) {
    const url = `${base}${ep}`;

    // Testa login com credenciais padrão
    const defaultCreds = [
      { email: 'admin@admin.com', password: 'admin' },
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'test@test.com', password: 'test' },
      { email: 'user@user.com', password: 'user' },
    ];

    for (const cred of defaultCreds) {
      const res = await fetchSafe(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred),
      });
      if (res?.ok) {
        vulns.push({
          type: 'auth_bypass',
          endpoint: ep,
          method: 'POST',
          severity: 'CRITICAL',
          description: `Credenciais padrão funcionam em ${ep}: login com "${cred.email}" / "${cred.password}" foi bem-sucedido.`,
          proof: { credentials: cred, statusCode: res.status },
        });
        break;
      }
    }

    // Brute force sem rate limiting
    const attempts = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        fetchSafe(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@test.com', password: `wrong${i}` }) })
      )
    );
    const all4xx = attempts.filter(r => r && r.status >= 400 && r.status < 500);
    if (all4xx.length === 5) {
      // Nenhum bloqueio — sem rate limiting
      vulns.push({
        type: 'rate_limit',
        endpoint: ep,
        method: 'POST',
        severity: 'MEDIUM',
        description: `Sem rate limiting no login em ${ep}: 5 tentativas seguidas sem bloqueio — vulnerável a brute force.`,
        proof: { attempts: 5, blocked: false },
      });
    }

    // SQL Injection
    const sqliPayloads = ["' OR '1'='1'--", "admin'--", "' OR 1=1--"];
    for (const payload of sqliPayloads) {
      const res = await fetchSafe(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload, password: 'x' }),
      });
      const text = await getText(res);
      if (res?.ok) {
        vulns.push({ type: 'sqli', endpoint: ep, method: 'POST', parameter: 'email', severity: 'CRITICAL', description: `SQL Injection confirmada em ${ep}: payload "${payload}" realiza login com sucesso.`, proof: { payload, statusCode: res.status } });
        break;
      }
      if (['sql', 'syntax error', 'mysql', 'postgresql', 'sqlite', 'ora-', 'exception'].some(e => text.toLowerCase().includes(e))) {
        vulns.push({ type: 'sqli', endpoint: ep, method: 'POST', parameter: 'email', severity: 'HIGH', description: `Erro SQL exposto em ${ep}: banco de dados retorna mensagens internas de erro.`, proof: { payload, sqlError: true, snippet: text.substring(0, 300) } });
        break;
      }
    }
  }
  return vulns;
}

// ─── 4. IDOR Check ────────────────────────────────────────────────
async function checkIDOR(base: string, endpoints: string[]) {
  const vulns: any[] = [];
  const resourcePaths = endpoints.filter(e =>
    ['/api/users', '/api/user', '/users', '/api/posts', '/api/orders', '/api/products', '/api/accounts'].some(p => e.startsWith(p))
  );
  if (resourcePaths.length === 0) resourcePaths.push('/api/users', '/api/posts', '/api/orders');

  for (const ep of resourcePaths) {
    const testIds = [1, 2, 3, 100, 1000];
    const results = await Promise.allSettled(
      testIds.map(id => fetchSafe(`${base}${ep}/${id}`, {}, 3000).then(async r => ({
        id, ok: r?.ok, status: r?.status,
        data: r?.ok ? await getText(r) : null,
      })))
    );

    const accessible = results.filter(r => r.status === 'fulfilled' && r.value.ok);
    if (accessible.length > 0) {
      const sample = (accessible[0] as any).value;
      const sensitiveFields = ['email', 'password', 'token', 'cpf', 'phone', 'address', 'credit'].filter(
        f => sample.data?.toLowerCase().includes(f)
      );
      vulns.push({
        type: 'idor',
        endpoint: `${ep}/:id`,
        method: 'GET',
        severity: sensitiveFields.length > 0 ? 'CRITICAL' : 'HIGH',
        description: `IDOR em ${ep}/:id — ${accessible.length}/${testIds.length} IDs acessíveis sem autenticação.${sensitiveFields.length > 0 ? ` Expõe campos sensíveis: ${sensitiveFields.join(', ')}.` : ''}`,
        proof: { accessibleIds: accessible.length, testedIds: testIds, sensitiveFields },
      });

      // Testa modificação
      const modRes = await fetchSafe(`${base}${ep}/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'hacked@evil.com', name: 'HACKED' }),
      });
      if (modRes?.ok) {
        vulns.push({
          type: 'idor',
          endpoint: `${ep}/:id`,
          method: 'PUT',
          severity: 'CRITICAL',
          description: `IDOR Write em ${ep}/:id — é possível modificar dados de qualquer usuário sem autenticação.`,
          proof: { method: 'PUT', statusCode: modRes.status },
        });
      }
    }
  }
  return vulns;
}

// ─── 5. Exposed Sensitive Endpoints ──────────────────────────────
async function checkExposedEndpoints(base: string, endpoints: string[]) {
  const vulns: any[] = [];
  const sensitive = [
    { path: '/api/admin', severity: 'CRITICAL', desc: 'Painel admin acessível sem autenticação' },
    { path: '/api/admin/users', severity: 'CRITICAL', desc: 'Lista de usuários admin exposta' },
    { path: '/api/users', severity: 'HIGH', desc: 'Lista completa de usuários exposta publicamente' },
    { path: '/api/config', severity: 'HIGH', desc: 'Configurações internas do sistema expostas' },
    { path: '/api/debug', severity: 'HIGH', desc: 'Endpoint de debug ativo em produção' },
    { path: '/.env', severity: 'CRITICAL', desc: 'Arquivo .env com variáveis de ambiente exposto' },
    { path: '/api/keys', severity: 'CRITICAL', desc: 'API keys expostas sem autenticação' },
    { path: '/phpinfo.php', severity: 'HIGH', desc: 'phpinfo() exposto — revela configurações do servidor' },
    { path: '/api/backup', severity: 'HIGH', desc: 'Backup do sistema acessível' },
    { path: '/graphql', severity: 'MEDIUM', desc: 'GraphQL introspection habilitada — expõe schema completo' },
    { path: '/swagger', severity: 'MEDIUM', desc: 'Swagger UI exposto — documenta todos os endpoints' },
    { path: '/openapi.json', severity: 'MEDIUM', desc: 'Especificação OpenAPI exposta publicamente' },
  ];

  const results = await Promise.allSettled(
    sensitive.map(s => fetchSafe(`${base}${s.path}`, {}, 3000).then(async r => ({
      ...s, ok: r?.ok, status: r?.status,
      body: r?.ok ? (await getText(r)).substring(0, 200) : '',
    })))
  );

  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.ok) {
      const { path, severity, desc, status, body } = r.value;
      vulns.push({
        type: path === '/.env' ? 'information_disclosure' : 'auth_bypass',
        endpoint: path,
        method: 'GET',
        severity,
        description: desc,
        proof: { statusCode: status, preview: body },
      });
    }
  });

  return vulns;
}

// ─── 6. Security Headers ─────────────────────────────────────────
async function checkHeaders(base: string) {
  const vulns: any[] = [];
  const res = await fetchSafe(base, {}, 4000);
  if (!res) return vulns;
  const h = Object.fromEntries(res.headers.entries());

  const missing: string[] = [];
  if (!h['x-frame-options'] && !h['content-security-policy']) missing.push('X-Frame-Options (vulnerável a Clickjacking)');
  if (!h['x-content-type-options']) missing.push('X-Content-Type-Options (MIME sniffing)');
  if (!h['strict-transport-security']) missing.push('HSTS (conexões HTTP não seguras)');
  if (!h['content-security-policy']) missing.push('Content-Security-Policy (XSS)');
  if (!h['x-xss-protection']) missing.push('X-XSS-Protection');

  if (missing.length >= 2) {
    vulns.push({
      type: 'misconfiguration',
      endpoint: '/',
      method: 'GET',
      severity: missing.length >= 4 ? 'HIGH' : 'MEDIUM',
      description: `${missing.length} headers de segurança ausentes: ${missing.join(' | ')}`,
      proof: { missingHeaders: missing },
    });
  }

  if (h['server'] && h['server'].length > 2) {
    vulns.push({ type: 'information_disclosure', endpoint: '/', method: 'GET', severity: 'LOW', description: `Versão do servidor exposta no header "Server": "${h['server']}"`, proof: { serverHeader: h['server'] } });
  }
  if (h['x-powered-by']) {
    vulns.push({ type: 'information_disclosure', endpoint: '/', method: 'GET', severity: 'LOW', description: `Tecnologia exposta no header "X-Powered-By": "${h['x-powered-by']}"`, proof: { poweredBy: h['x-powered-by'] } });
  }

  return vulns;
}

// ─── 7. JWT / Token Tests ─────────────────────────────────────────
async function checkTokens(base: string, endpoints: string[]) {
  const vulns: any[] = [];
  const protectedPaths = endpoints.filter(e =>
    ['/api/users/me', '/api/profile', '/api/me', '/api/account', '/api/dashboard'].some(p => e.includes(p))
  );
  if (protectedPaths.length === 0) protectedPaths.push('/api/users/me', '/api/profile', '/api/me');

  for (const ep of protectedPaths) {
    // Testa sem token
    const noTokenRes = await fetchSafe(`${base}${ep}`, {}, 3000);
    if (noTokenRes?.ok) {
      vulns.push({
        type: 'auth_bypass',
        endpoint: ep,
        method: 'GET',
        severity: 'HIGH',
        description: `Endpoint protegido ${ep} acessível sem token de autenticação.`,
        proof: { statusCode: noTokenRes.status },
      });
    }

    // Testa com token inválido
    const fakeTokenRes = await fetchSafe(`${base}${ep}`, {
      headers: { Authorization: 'Bearer fake.token.here' },
    }, 3000);
    if (fakeTokenRes?.ok) {
      vulns.push({
        type: 'auth_bypass',
        endpoint: ep,
        method: 'GET',
        severity: 'CRITICAL',
        description: `Token inválido aceito em ${ep}: a API não valida a assinatura do JWT.`,
        proof: { fakeToken: 'fake.token.here', statusCode: fakeTokenRes.status },
      });
    }

    // Testa com JWT "alg: none"
    const noneJwt = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJyb2xlIjoiYWRtaW4ifQ.';
    const noneRes = await fetchSafe(`${base}${ep}`, {
      headers: { Authorization: `Bearer ${noneJwt}` },
    }, 3000);
    if (noneRes?.ok) {
      vulns.push({
        type: 'auth_bypass',
        endpoint: ep,
        method: 'GET',
        severity: 'CRITICAL',
        description: `JWT "alg:none" aceito em ${ep}: servidor aceita tokens sem assinatura — vulnerabilidade crítica de autenticação.`,
        proof: { jwtAlgNone: true, statusCode: noneRes.status },
      });
    }
  }
  return vulns;
}

// ─── MASTER SCAN ─────────────────────────────────────────────────
async function fullScan(targetUrl: string) {
  const base = targetUrl.replace(/\/$/, '');
  console.log(`🔍 Starting full scan on ${base}`);

  // Primeiro descobre endpoints
  const endpoints = await discoverEndpoints(base);
  console.log(`📡 Found ${endpoints.length} endpoints`);

  // Roda todos os checks em paralelo
  const [headers, exposed, registration, auth, idor, tokens] = await Promise.allSettled([
    checkHeaders(base),
    checkExposedEndpoints(base, endpoints),
    checkRegistration(base, endpoints),
    checkAuth(base, endpoints),
    checkIDOR(base, endpoints),
    checkTokens(base, endpoints),
  ]);

  const all: any[] = [];
  [headers, exposed, registration, auth, idor, tokens].forEach(r => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });

  // Remove duplicatas por endpoint+type
  const unique = all.filter((v, i, arr) =>
    arr.findIndex(x => x.type === v.type && x.endpoint === v.endpoint && x.method === v.method) === i
  );

  console.log(`✅ Scan complete: ${unique.length} vulnerabilities found`);
  return unique;
}

// ─── API ROUTE ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { targetUrl } = await request.json();
    if (!targetUrl) return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    try { new URL(targetUrl); } catch { return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 }); }

    const [scan] = await db.insert(scans).values({ targetUrl, status: 'running' }).returning();

    let found: any[] = [];
    try {
      found = await Promise.race([
        fullScan(targetUrl),
        new Promise<any[]>(resolve => setTimeout(() => resolve([]), 55000)),
      ]);
    } catch (e) { console.error('Scan error:', e); }

    if (found.length > 0) {
      await db.insert(vulnerabilities).values(
        found.map(v => ({
          scanId: scan.id,
          type: v.type,
          endpoint: v.endpoint,
          method: v.method || 'GET',
          parameter: v.parameter || null,
          severity: v.severity,
          description: v.description,
          proof: v.proof || null,
        }))
      );
    }

    await db.update(scans).set({ status: 'completed', completedAt: new Date() }).where(eq(scans.id, scan.id));
    return NextResponse.json({ scanId: scan.id, status: 'completed', vulnerabilitiesFound: found.length });

  } catch (error: any) {
    console.error('POST /api/scans error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const all = await db.select().from(scans).orderBy(scans.createdAt);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
