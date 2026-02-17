#!/bin/bash

# VulnHunter Setup Script
# Este script automatiza a instalação local do VulnHunter

set -e

echo "
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║         🎯 VulnHunter Setup Script                      ║
║         Advanced Vulnerability Scanner                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Verificar Node.js
echo "Verificando requisitos..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    echo "Visite: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION detectada. Necessário v18+."
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# 2. Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado"
    exit 1
fi
print_success "npm $(npm -v) detectado"

# 3. Instalar dependências
echo ""
echo "Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas"
else
    print_error "Falha ao instalar dependências"
    exit 1
fi

# 4. Verificar .env
echo ""
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado"
    echo ""
    echo "Escolha uma opção de banco de dados:"
    echo "1) Vercel Postgres (Recomendado)"
    echo "2) Supabase (Grátis)"
    echo "3) PostgreSQL Local"
    echo "4) Pular configuração do banco (configurar manualmente depois)"
    echo ""
    read -p "Opção [1-4]: " db_option

    case $db_option in
        1)
            echo ""
            echo "📝 Configure o Vercel Postgres:"
            echo "1. Acesse: https://vercel.com"
            echo "2. Crie um projeto"
            echo "3. Vá em Storage → Create → Postgres"
            echo "4. Copie a POSTGRES_URL"
            echo ""
            read -p "Cole sua POSTGRES_URL aqui: " postgres_url
            echo "POSTGRES_URL=\"$postgres_url\"" > .env
            print_success "Arquivo .env criado"
            ;;
        2)
            echo ""
            echo "📝 Configure o Supabase:"
            echo "1. Acesse: https://supabase.com"
            echo "2. Crie um projeto"
            echo "3. Vá em Settings → Database"
            echo "4. Copie a connection string"
            echo ""
            read -p "Cole sua connection string: " postgres_url
            echo "POSTGRES_URL=\"$postgres_url\"" > .env
            print_success "Arquivo .env criado"
            ;;
        3)
            echo ""
            print_warning "Certifique-se que o PostgreSQL está rodando localmente"
            echo "POSTGRES_URL=\"postgresql://postgres:postgres@localhost:5432/vulnhunter\"" > .env
            print_success "Arquivo .env criado com configuração local padrão"
            echo ""
            print_warning "Não esqueça de criar o banco: CREATE DATABASE vulnhunter;"
            ;;
        4)
            cp .env.example .env
            print_warning "Arquivo .env criado. Configure manualmente antes de continuar."
            ;;
        *)
            print_error "Opção inválida"
            exit 1
            ;;
    esac
else
    print_success "Arquivo .env encontrado"
fi

# 5. Aplicar migrations
if [ -f ".env" ] && [ "$db_option" != "4" ]; then
    echo ""
    echo "Aplicando schema do banco de dados..."
    npm run db:push

    if [ $? -eq 0 ]; then
        print_success "Schema aplicado com sucesso"
    else
        print_error "Falha ao aplicar schema"
        print_warning "Você pode tentar novamente com: npm run db:push"
    fi
fi

# 6. Verificar se quer instalar DVWA
echo ""
read -p "Deseja instalar DVWA (ambiente de testes) via Docker? [y/N]: " install_dvwa

if [[ $install_dvwa =~ ^[Yy]$ ]]; then
    if command -v docker &> /dev/null; then
        echo "Instalando DVWA..."
        docker run -d -p 80:80 --name vulnhunter-dvwa vulnerables/web-dvwa
        
        if [ $? -eq 0 ]; then
            print_success "DVWA instalado em http://localhost"
            echo "   Credenciais:"
            echo "   Username: admin"
            echo "   Password: password"
        else
            print_error "Falha ao instalar DVWA"
        fi
    else
        print_warning "Docker não encontrado. Instale Docker para usar DVWA."
    fi
fi

# 7. Finalização
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║         ✅ Setup Concluído!                             ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Inicie o servidor:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Acesse no navegador:"
echo "   ${GREEN}http://localhost:3000${NC}"
echo ""
if [[ $install_dvwa =~ ^[Yy]$ ]]; then
    echo "3. Teste com DVWA:"
    echo "   ${GREEN}http://localhost${NC}"
    echo ""
fi
echo "4. Leia a documentação:"
echo "   ${GREEN}README.md${NC} - Documentação completa"
echo "   ${GREEN}QUICKSTART.md${NC} - Guia rápido"
echo "   ${GREEN}TESTING.md${NC} - Como testar"
echo ""
print_warning "⚠️  IMPORTANTE: Use apenas em sistemas autorizados!"
echo ""
