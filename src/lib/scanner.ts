import * as cheerio from 'cheerio';

export interface ScanResult {
  vulnerabilities: Array<{
    type: string;
    endpoint: string;
    method: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    parameter?: string;
    proof?: any;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export class VulnerabilityScanner {
  private targetUrl: string;
  private foundEndpoints: Set<string> = new Set();

  constructor(targetUrl: string) {
    this.targetUrl = targetUrl.replace(/\/$/, '');
  }

  async scan(): Promise<ScanResult> {
    const vulnerabilities: ScanResult['vulnerabilities'] = [];

    console.log(`🔍 Iniciando scan em ${this.targetUrl}...`);

    // 1. Descobre endpoints
    await this.discoverEndpoints();

    // 2. Testa vulnerabilidades comuns
    const registrationVulns = await this.checkRegistrationVulns();
    const idorVulns = await this.checkIDORVulns();
    const sqliVulns = await this.checkSQLIVulns();
    const authVulns = await this.checkAuthVulns();

    vulnerabilities.push(...registrationVulns, ...idorVulns, ...sqliVulns, ...authVulns);

    // 3. Calcula summary
    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      low: vulnerabilities.filter(v => v.severity === 'LOW').length,
    };

    console.log(`✅ Scan completo! ${vulnerabilities.length} vulnerabilidades encontradas`);

    return { vulnerabilities, summary };
  }

  private async discoverEndpoints() {
    const commonEndpoints = [
      '/api/register',
      '/api/login',
      '/api/users',
      '/api/user',
      '/api/profile',
      '/api/admin',
      '/api/posts',
      '/api/comments',
      '/register',
      '/login',
      '/users',
      '/admin',
    ];

    for (const endpoint of commonEndpoints) {
      try {
        const response = await fetch(`${this.targetUrl}${endpoint}`, {
          method: 'GET',
          redirect: 'manual',
        });

        if (response.status !== 404) {
          this.foundEndpoints.add(endpoint);
        }
      } catch {}
    }

    // Tenta descobrir via sitemap ou robots.txt
    try {
      const robotsResponse = await fetch(`${this.targetUrl}/robots.txt`);
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();
        const paths = robotsText.match(/\/.+/g) || [];
        paths.forEach(path => this.foundEndpoints.add(path));
      }
    } catch {}
  }

  private async checkRegistrationVulns() {
    const vulns: ScanResult['vulnerabilities'] = [];
    const registrationEndpoints = ['/api/register', '/register', '/signup', '/api/signup'];

    for (const endpoint of registrationEndpoints) {
      if (!this.foundEndpoints.has(endpoint)) continue;

      try {
        // Testa se aceita registro sem validação
        const response = await fetch(`${this.targetUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test_${Date.now()}@test.com`,
            password: 'test123',
            role: 'admin',
          }),
        });

        if (response.status >= 200 && response.status < 300) {
          vulns.push({
            type: 'registration',
            endpoint,
            method: 'POST',
            severity: 'HIGH',
            description: 'Endpoint de registro permite criação de contas sem validação adequada',
            proof: { statusCode: response.status },
          });
        }
      } catch {}
    }

    return vulns;
  }

  private async checkIDORVulns() {
    const vulns: ScanResult['vulnerabilities'] = [];
    const resourceEndpoints = [
      '/api/users/',
      '/api/user/',
      '/api/posts/',
      '/api/comments/',
      '/users/',
    ];

    for (const endpoint of resourceEndpoints) {
      try {
        // Testa acesso a recursos por ID
        const testIds = [1, 2, 100, 1000];
        let accessibleCount = 0;

        for (const id of testIds) {
          const response = await fetch(`${this.targetUrl}${endpoint}${id}`);
          if (response.ok) {
            accessibleCount++;
          }
        }

        if (accessibleCount > 0) {
          vulns.push({
            type: 'idor',
            endpoint,
            method: 'GET',
            severity: 'CRITICAL',
            description: `IDOR detectado: ${accessibleCount}/${testIds.length} recursos acessíveis sem autenticação`,
            proof: { accessibleResources: accessibleCount },
          });
        }
      } catch {}
    }

    return vulns;
  }

  private async checkSQLIVulns() {
    const vulns: ScanResult['vulnerabilities'] = [];
    const loginEndpoints = ['/api/login', '/login', '/api/auth'];

    for (const endpoint of loginEndpoints) {
      if (!this.foundEndpoints.has(endpoint)) continue;

      try {
        const sqliPayload = "' OR '1'='1";
        const response = await fetch(`${this.targetUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: sqliPayload,
            password: 'any',
          }),
        });

        const responseText = await response.text();
        
        if (
          response.ok ||
          responseText.toLowerCase().includes('sql') ||
          responseText.toLowerCase().includes('syntax')
        ) {
          vulns.push({
            type: 'sqli',
            endpoint,
            method: 'POST',
            parameter: 'username',
            severity: 'CRITICAL',
            description: 'Possível SQL Injection detectada',
            proof: { 
              statusCode: response.status,
              containsSqlError: responseText.toLowerCase().includes('sql'),
            },
          });
        }
      } catch {}
    }

    return vulns;
  }

  private async checkAuthVulns() {
    const vulns: ScanResult['vulnerabilities'] = [];
    const protectedEndpoints = ['/api/admin', '/admin', '/api/users'];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await fetch(`${this.targetUrl}${endpoint}`);
        
        if (response.ok) {
          vulns.push({
            type: 'auth_bypass',
            endpoint,
            method: 'GET',
            severity: 'HIGH',
            description: 'Endpoint protegido acessível sem autenticação',
          });
        }
      } catch {}
    }

    return vulns;
  }
}
