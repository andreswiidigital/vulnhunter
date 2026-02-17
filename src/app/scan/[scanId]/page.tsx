'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, Loader2, Shield, Target, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ExploitCard from '@/components/ExploitCard';

interface Vulnerability {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  exploited: boolean;
  parameter?: string;
}

interface Scan {
  id: string;
  targetUrl: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, exploited: 0 });

  const loadScanData = useCallback(async () => {
    try {
      const response = await fetch(`/api/scans/${scanId}`);
      if (!response.ok) { toast.error('Scan não encontrado'); setLoading(false); return; }
      const data = await response.json();
      setScan(data.scan);
      setVulnerabilities(data.vulnerabilities || []);
      setSummary(data.summary);
      // Para o polling assim que o scan terminar
      if (data.scan.status === 'completed' || data.scan.status === 'failed') {
        setPolling(false);
      }
    } catch {
      toast.error('Erro ao carregar scan');
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    loadScanData();
  }, [loadScanData]);

  // Polling — só roda enquanto `polling === true`
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(loadScanData, 3000);
    return () => clearInterval(interval);
  }, [polling, loadScanData]);

  const handleExploitComplete = (vulnId: string) => {
    setVulnerabilities(prev => prev.map(v => v.id === vulnId ? { ...v, exploited: true } : v));
    setSummary(prev => ({ ...prev, exploited: prev.exploited + 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando scan...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400">Scan não encontrado</p>
          <button onClick={() => router.push('/')} className="btn-secondary mt-4">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-200">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-100/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-neon-green" />
                <div>
                  <h1 className="text-lg font-bold">Scan Results</h1>
                  <p className="text-sm text-gray-400 truncate max-w-xs">{scan.targetUrl}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {scan.status === 'running' && (
                <span className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 rounded-full text-sm">
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" /> Scanning...
                </span>
              )}
              {scan.status === 'completed' && (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Completed
                </span>
              )}
              {scan.status === 'failed' && (
                <span className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Failed
                </span>
              )}
              <button onClick={loadScanData} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total', value: summary.total, color: 'text-white', border: '' },
            { label: 'Critical', value: summary.critical, color: 'text-red-400', border: 'border-red-500/30 bg-red-900/10' },
            { label: 'High', value: summary.high, color: 'text-orange-400', border: 'border-orange-500/30 bg-orange-900/10' },
            { label: 'Medium', value: summary.medium, color: 'text-yellow-400', border: 'border-yellow-500/30 bg-yellow-900/10' },
            { label: 'Low', value: summary.low, color: 'text-blue-400', border: 'border-blue-500/30 bg-blue-900/10' },
            { label: 'Exploited', value: summary.exploited, color: 'text-green-400', border: 'border-green-500/30 bg-green-900/10' },
          ].map(s => (
            <div key={s.label} className={`card ${s.border}`}>
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {summary.total > 0 && (
          <div className="card mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Exploitation Progress</span>
              <span className="text-gray-400">{summary.exploited}/{summary.total} ({Math.round((summary.exploited / summary.total) * 100)}%)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div className="bg-gradient-to-r from-neon-green to-neon-blue h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.total ? (summary.exploited / summary.total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* Vulnerabilities */}
        {vulnerabilities.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-neon-green" />
              {vulnerabilities.length} Vulnerabilidade{vulnerabilities.length !== 1 ? 's' : ''} Encontrada{vulnerabilities.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vulnerabilities.map(vuln => (
                <ExploitCard key={vuln.id} vulnerability={vuln} targetUrl={scan.targetUrl}
                  onExploitComplete={() => handleExploitComplete(vuln.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-20">
            {scan.status === 'running' ? (
              <>
                <div className="w-20 h-20 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-xl font-semibold">Escaneando alvo...</p>
                <p className="text-gray-500 mt-2">Testando vulnerabilidades em paralelo</p>
                <p className="text-gray-600 text-sm mt-1">Isso pode levar até 30 segundos</p>
              </>
            ) : scan.status === 'failed' ? (
              <>
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-xl text-red-400">Scan falhou</p>
                <p className="text-gray-500 mt-2">Verifique se a URL está acessível</p>
                <button onClick={() => router.push('/')} className="btn-secondary mt-6">Tentar Novamente</button>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-xl font-semibold">Nenhuma vulnerabilidade encontrada</p>
                <p className="text-gray-500 mt-2">O alvo parece estar bem protegido</p>
                <p className="text-gray-600 text-sm mt-1">Tente com um alvo como https://juice-shop.herokuapp.com</p>
                <button onClick={() => router.push('/')} className="btn-secondary mt-6">Novo Scan</button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
