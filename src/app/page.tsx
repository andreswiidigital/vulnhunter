'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Zap, Target, AlertTriangle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) { toast.error('Insira uma URL'); return; }

    setScanning(true);
    setScanStatus('Iniciando scan...');

    try {
      setScanStatus('Detectando vulnerabilidades...');
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanStatus(`Concluído! ${data.vulnerabilitiesFound} vulnerabilidade(s) encontrada(s)`);
        toast.success(`Scan concluído! ${data.vulnerabilitiesFound} vulnerabilidade(s) encontrada(s)`);
        setTimeout(() => router.push(`/scan/${data.scanId}`), 800);
      } else {
        toast.error(data.error || 'Erro ao iniciar scan');
        setScanning(false);
        setScanStatus('');
      }
    } catch {
      toast.error('Erro de conexão com o servidor');
      setScanning(false);
      setScanStatus('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-100/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-neon-green" />
          <h1 className="text-2xl font-bold text-neon-green" style={{ textShadow: '0 0 10px #00ff41' }}>
            VulnHunter
          </h1>
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">v2.0</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full mb-8">
            <Zap className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-neon-green font-semibold">Advanced Vulnerability Scanner</span>
          </div>

          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Descubra e Explore{' '}
            <span className="text-neon-green" style={{ textShadow: '0 0 20px #00ff41' }}>
              Vulnerabilidades Reais
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-12">
            Scanner automático que detecta IDOR, SQL Injection, endpoints expostos e muito mais — com exploits prontos para testar.
          </p>

          {/* Form */}
          <form onSubmit={handleScan} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://alvo.com"
                  className="input pl-12 text-lg h-14"
                  disabled={scanning}
                  required
                />
              </div>
              <button type="submit" disabled={scanning}
                className="btn-primary px-8 h-14 text-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed">
                {scanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-300 border-t-transparent rounded-full animate-spin" />
                    {scanStatus || 'Scanning...'}
                  </>
                ) : (
                  <><Target className="w-5 h-5" /> Iniciar Scan</>
                )}
              </button>
            </div>

            {/* Progress bar while scanning */}
            {scanning && (
              <div className="mt-4">
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-neon-green h-1.5 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{scanStatus}</p>
              </div>
            )}
          </form>

          {/* Warning */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              <strong>Aviso Legal:</strong> Use apenas em sistemas com permissão explícita. Testes não autorizados são ilegais.
            </p>
          </div>

          {/* Test targets */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500">Testar com:</span>
            {['https://juice-shop.herokuapp.com', 'http://testphp.vulnweb.com'].map(url => (
              <button key={url} onClick={() => setTargetUrl(url)}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
                {url.replace('https://', '').replace('http://', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: <Target className="w-6 h-6 text-neon-green" />, bg: 'bg-neon-green/10', title: 'Detecção Automática', desc: 'Scanner paralelo detecta IDOR, SQLi, endpoints expostos, headers inseguros e mais em segundos' },
            { icon: <Zap className="w-6 h-6 text-neon-blue" />, bg: 'bg-neon-blue/10', title: 'Exploits Reais', desc: 'Execute ataques reais com payloads prontos e veja o impacto de cada vulnerabilidade' },
            { icon: <Shield className="w-6 h-6 text-neon-purple" />, bg: 'bg-neon-purple/10', title: 'Evidências Completas', desc: 'Logs detalhados, comandos cURL e exportação de provas para relatórios de pentest' },
          ].map((f, i) => (
            <div key={i} className="card hover:border-gray-600 transition-all">
              <div className={`w-12 h-12 ${f.bg} rounded-lg flex items-center justify-center mb-4`}>{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          VulnHunter © 2024 — Ferramenta educacional para profissionais de segurança
        </div>
      </footer>
    </div>
  );
}
