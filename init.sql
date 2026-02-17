-- VulnHunter Database Schema
-- Run this with: npm run db:push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vulnerabilities table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    endpoint TEXT NOT NULL,
    method VARCHAR(10),
    parameter TEXT,
    severity VARCHAR(20),
    description TEXT,
    proof JSONB,
    exploited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exploits table
CREATE TABLE IF NOT EXISTS exploits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vulnerability_id UUID REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    exploit_type VARCHAR(100) NOT NULL,
    payload JSONB,
    result JSONB,
    evidence JSONB,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_exploits_vulnerability_id ON exploits(vulnerability_id);

-- Comentários
COMMENT ON TABLE scans IS 'Armazena informações sobre scans de vulnerabilidades';
COMMENT ON TABLE vulnerabilities IS 'Vulnerabilidades detectadas em cada scan';
COMMENT ON TABLE exploits IS 'Histórico de exploits executados';
