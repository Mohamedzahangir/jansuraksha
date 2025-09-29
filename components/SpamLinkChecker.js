'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Loader, Eye, Zap, Globe, Lock } from 'lucide-react';

const SpamLinkChecker = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to analyze');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'dangerous':
        return <Shield className="w-6 h-6 text-red-500" />;
      default:
        return <Eye className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'border-emerald-200/50 bg-emerald-950/20';
      case 'suspicious':
        return 'border-amber-200/50 bg-amber-950/20';
      case 'dangerous':
        return 'border-red-200/50 bg-red-950/20';
      default:
        return 'border-slate-700 bg-slate-800/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'suspicious':
        return 'Suspicious';
      case 'dangerous':
        return 'Dangerous';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceBarColor = (confidence, status) => {
    if (status === 'safe') return 'bg-emerald-500';
    if (status === 'suspicious') return 'bg-amber-500';
    if (status === 'dangerous') return 'bg-red-500';
    return 'bg-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                SecureLink AI
              </h1>
              <p className="text-slate-400 text-sm">AI-powered URL security analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Protect Yourself from Malicious Links
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Advanced AI analysis to detect spam, phishing, and malicious URLs before you click
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 mb-8 shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Enter URL for Analysis</h3>
          
          <div className="space-y-4">
            <div className="relative group">
              <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-300 transition-colors" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://suspicious-link.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all duration-300 hover:bg-slate-800/70"
                onKeyPress={(e) => e.key === 'Enter' && !loading && analyzeUrl()}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={analyzeUrl}
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Analyzing URL...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Analyze URL Security</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl border ${getStatusColor(result.status)} p-8 shadow-2xl transform transition-all duration-500 animate-fadeIn`}>
            {/* Status Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  {getStatusIcon(result.status)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {getStatusText(result.status)}
                  </h3>
                  <p className="text-slate-400">
                    Security Analysis Complete
                  </p>
                </div>
              </div>
              
              {/* Confidence Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">
                  {result.confidence}%
                </div>
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getConfidenceBarColor(result.confidence, result.status)} transition-all duration-1000`}
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">Confidence</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Key Findings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Key Findings
                </h4>
                <div className="space-y-3">
                  {result.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-200 text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Recommendation
                </h4>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <p className="text-slate-200 mb-4 font-medium">{result.recommendation}</p>
                  <div className="p-4 bg-slate-700/20 rounded-lg">
                    <p className="text-sm text-slate-300 leading-relaxed">{result.details}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'AI-Powered Detection',
              description: 'Advanced machine learning algorithms analyze URLs for potential threats and malicious patterns'
            },
            {
              icon: Globe,
              title: 'Real-time Analysis',
              description: 'Instant security assessments with comprehensive threat intelligence and risk scoring'
            },
            {
              icon: Lock,
              title: 'Comprehensive Scanning',
              description: 'Multi-layered security checks including domain reputation, SSL analysis, and pattern detection'
            }
          ].map((feature, index) => (
            <div key={index} className="group relative">
              <div className="p-6 bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit mb-4 group-hover:bg-slate-700/50 transition-colors">
                  <feature.icon className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium">SecureLink AI</span>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stay protected online. Always verify suspicious links and never share sensitive information on untrusted websites.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SpamLinkChecker;