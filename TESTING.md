# 🎯 Ambiente de Testes - DVWA Setup

Este guia ajuda você a configurar o DVWA (Damn Vulnerable Web Application) para testar o VulnHunter.

## Opção 1: Docker (Recomendado)

### Instalação Rápida

```bash
# Baixar e rodar DVWA
docker run -d -p 80:80 vulnerables/web-dvwa

# Aguarde 30 segundos e acesse
# URL: http://localhost
```

### Configuração Inicial

1. Acesse: http://localhost
2. Login padrão:
   - **Username**: `admin`
   - **Password**: `password`

3. Vá em **Setup/Reset DB** e clique em **Create / Reset Database**

4. Faça login novamente

5. Configure nível de segurança:
   - Vá em **DVWA Security**
   - Selecione **Low**
   - Clique em **Submit**

### URLs para Testar no VulnHunter

```
# SQL Injection
http://localhost/vulnerabilities/sqli/

# IDOR (File Inclusion)
http://localhost/vulnerabilities/fi/

# Brute Force
http://localhost/vulnerabilities/brute/

# XSS Reflected
http://localhost/vulnerabilities/xss_r/

# Upload de Arquivos
http://localhost/vulnerabilities/upload/
```

---

## Opção 2: Docker Compose (Completo)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  dvwa:
    image: vulnerables/web-dvwa
    ports:
      - "80:80"
    environment:
      - RECAPTCHA_PRIV_KEY=
      - RECAPTCHA_PUB_KEY=
    volumes:
      - dvwa-data:/var/lib/mysql

  juice-shop:
    image: bkimminich/juice-shop
    ports:
      - "3001:3000"

volumes:
  dvwa-data:
```

Execute:

```bash
docker-compose up -d
```

Agora você tem:
- **DVWA**: http://localhost
- **Juice Shop**: http://localhost:3001

---

## Opção 3: Instalação Manual (Linux)

### Requisitos
- Apache/Nginx
- PHP 7+
- MySQL/MariaDB

### Passos

```bash
# Clone DVWA
git clone https://github.com/digininja/DVWA.git
cd DVWA

# Configure banco de dados
cp config/config.inc.php.dist config/config.inc.php

# Edite config.inc.php
nano config/config.inc.php

# Altere:
$_DVWA[ 'db_server' ]   = 'localhost';
$_DVWA[ 'db_database' ] = 'dvwa';
$_DVWA[ 'db_user' ]     = 'dvwa';
$_DVWA[ 'db_password' ] = 'p@ssw0rd';

# Crie banco de dados
mysql -u root -p
CREATE DATABASE dvwa;
CREATE USER 'dvwa'@'localhost' IDENTIFIED BY 'p@ssw0rd';
GRANT ALL ON dvwa.* TO 'dvwa'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Mova para pasta web
sudo mv DVWA /var/www/html/

# Ajuste permissões
sudo chown -R www-data:www-data /var/www/html/DVWA
sudo chmod -R 755 /var/www/html/DVWA

# Acesse: http://localhost/DVWA
```

---

## Testando com VulnHunter

### 1. Inicie o DVWA

```bash
docker run -d -p 80:80 vulnerables/web-dvwa
```

### 2. Acesse VulnHunter

```bash
# Se rodando localmente
npm run dev
# Acesse: http://localhost:3000
```

### 3. Execute Scans

Na interface do VulnHunter:

**Teste 1 - SQL Injection**:
```
URL: http://localhost/vulnerabilities/sqli/
```

**Teste 2 - IDOR**:
```
URL: http://host.docker.internal/vulnerabilities/
```

**Teste 3 - Página inicial**:
```
URL: http://localhost
```

---

## Resultados Esperados

### DVWA (Security: Low)

Você deve encontrar:

| Vulnerabilidade | Severidade | Exploit |
|----------------|------------|---------|
| SQL Injection | CRITICAL | ✅ Funciona |
| IDOR | HIGH | ✅ Funciona |
| Auth Bypass | HIGH | ✅ Funciona |
| File Upload | HIGH | ✅ Funciona |

### DVWA (Security: Medium)

Alguns exploits podem falhar (esperado).

### DVWA (Security: High)

Maioria dos exploits falha (sistema bem protegido).

---

## Outros Ambientes de Teste

### OWASP Juice Shop

```bash
docker run -d -p 3001:3000 bkimminich/juice-shop
```

URLs para testar:
```
http://localhost:3001
http://localhost:3001/api/users
http://localhost:3001/api/products
```

### WebGoat

```bash
docker run -d -p 8080:8080 webgoat/goatandwolf
```

URL: http://localhost:8080/WebGoat

### HackTheBox Machines

Se você tem acesso ao HTB:
```
http://[target-ip]:porta
```

---

## Troubleshooting

### ❌ DVWA não inicia

```bash
# Ver logs
docker logs [container-id]

# Reiniciar
docker restart [container-id]

# Limpar e reinstalar
docker rm -f [container-id]
docker run -d -p 80:80 vulnerables/web-dvwa
```

### ❌ VulnHunter não acessa localhost

Se VulnHunter está em Docker/Vercel:

```bash
# Use host.docker.internal ao invés de localhost
URL: http://host.docker.internal
```

### ❌ Porta 80 já em uso

```bash
# Use outra porta
docker run -d -p 8080:80 vulnerables/web-dvwa

# Acesse: http://localhost:8080
```

---

## 🎓 Dicas de Aprendizado

### Para Iniciantes

1. Comece com DVWA no nível **Low**
2. Execute os exploits e veja o que acontece
3. Analise os logs em tempo real
4. Compare com a documentação OWASP

### Para Intermediários

1. Configure DVWA em **Medium**
2. Customize os exploits no código
3. Adicione novos payloads
4. Tente bypassar as proteções

### Para Avançados

1. DVWA em **High** ou **Impossible**
2. Crie exploits completamente novos
3. Implemente evasão de WAF
4. Contribua com o projeto

---

## 📚 Recursos Adicionais

- [DVWA Official](http://www.dvwa.co.uk/)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [Juice Shop](https://owasp.org/www-project-juice-shop/)
- [HackTheBox](https://www.hackthebox.com/)
- [PortSwigger Academy](https://portswigger.net/web-security)

---

✅ **Ambiente configurado!** Agora você está pronto para testar o VulnHunter com segurança.
