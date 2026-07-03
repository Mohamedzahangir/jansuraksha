'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, ExternalLink, Loader, Eye, Zap, Globe, Lock } from 'lucide-react';
import StatusBadge, { getStatusColor, getStatusText } from './StatusBadge';
import FeatureCard from './FeatureCard';

const FEATURES = [
  {
    icon: Shield,
    title: 'AI-Powered Detection',
    description: 'Advanced machine learning algorithms analyze URLs for potential threats and malicious patterns',
  },
  {
    icon: Globe,
    title: 'Real-time Analysis',
    description: 'Instant security assessments with comprehensive threat intelligence and risk scoring',
  },
  {
    icon: Lock,
    title: 'Comprehensive Scanning',
    description: 'Multi-layered security checks including domain reputation, SSL analysis, and pattern detection',
  },
];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      analyzeUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800/10 rounded-full blur-3xl bg-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-700/10 rounded-full blur-3xl bg-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                Jan Suraksha
              </h1>
              <p className="text-text-secondary text-sm tracking-wide uppercase">check before you click</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-none mb-4">
            Check any link<br />before you click
          </h2>
          <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
            Paste a suspicious URL and get an instant security verdict — not a guess.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-4 sm:p-8 mb-8 shadow-2xl">
          <h3 id="url-form-title" className="text-lg font-display font-semibold text-white tracking-wide">Enter a URL to check</h3>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative group">
              <ExternalLink aria-hidden="true" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-300 transition-colors" />
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://suspicious-link.com"
                aria-labelledby="url-form-title"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'url-error' : undefined}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:border-slate-500 transition-all duration-300 hover:bg-slate-800/70"
              />
            </div>

            {error && (
              <div id="url-error" role="alert" className="flex items-center gap-2 p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
                <AlertTriangle aria-hidden="true" className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {loading && 'Analyzing URL, please wait.'}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {loading ? (
                <>
                  <Loader aria-hidden="true" className="w-5 h-5 animate-spin" />
                  <span>Analyzing URL...</span>
                </>
              ) : (
                <>
                  <Zap aria-hidden="true" className="w-5 h-5" />
                  <span>Analyze URL Security</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Empty State */}
        {!result && !loading && (
          <div
            className="mb-8 p-6 bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-dashed border-slate-800/50 text-center"
            aria-hidden="true"
          >
            <Eye className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Paste a URL above and click Analyze to see security findings, risk level, and recommendations.
            </p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div
            role="region"
            aria-live="polite"
            aria-label={`Analysis results: ${getStatusText(result.status)}, ${result.confidence}% confidence`}
            className={`bg-slate-900/40 backdrop-blur-xl rounded-2xl border ${getStatusColor(result.status)} p-4 sm:p-8 shadow-2xl transform transition-all duration-500 animate-fadeIn`}
          >
            <StatusBadge status={result.status} confidence={result.confidence} />

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Key Findings */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <Eye aria-hidden="true" className="w-5 h-5" />
                  Key Findings
                </h4>
                <div className="space-y-3">
                  {result.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                      <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-200 text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <Lock aria-hidden="true" className="w-5 h-5" />
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
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-medium">Jan Suraksha</span>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stay protected online. Always verify suspicious links and never share sensitive information on untrusted websites.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SpamLinkChecker;
