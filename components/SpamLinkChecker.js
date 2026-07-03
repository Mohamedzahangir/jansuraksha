'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, ExternalLink, Loader, Eye, Zap, Globe, Lock } from 'lucide-react';
import StatusBadge, { getStatusColor, getStatusText } from './StatusBadge';
import FeatureCard from './FeatureCard';

const FEATURES = [
  {
    icon: Shield,
    title: 'Pattern Recognition',
    description: 'Every link is checked against known phishing patterns, domain anomalies, and deceptive redirect chains.',
  },
  {
    icon: Globe,
    title: 'Instant Verdict',
    description: 'Results in seconds with a clear Safe, Suspicious, or Dangerous rating — and why.',
  },
  {
    icon: Lock,
    title: 'Deep Inspection',
    description: 'Beyond the surface: domain reputation, SSL validity, and link structure are all examined.',
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
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
              <Shield className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight">
                Jan Suraksha
              </h1>
              <p className="text-text-secondary text-xs tracking-widest uppercase">check before you click</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-none mb-3">
            Check any link<br />before you click
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
            Paste a URL and get an instant security verdict — not a guess.
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative group">
              <h3 id="url-form-title" className="sr-only">Enter a URL to check</h3>
              <ExternalLink aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-amber transition-colors" />
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://suspicious-link.com"
                aria-labelledby="url-form-title"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'url-error' : undefined}
                className="w-full pl-10 pr-4 py-3.5 bg-surface-raised border border-white/10 rounded-lg text-white placeholder-text-secondary/50 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-amber focus-visible:border-amber/50 transition-all duration-200"
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
            </div>

            {error && (
              <div id="url-error" role="alert" className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <AlertTriangle aria-hidden="true" className="w-4 h-4 text-danger flex-shrink-0" />
                <p className="text-xs text-white/70">{error}</p>
              </div>
            )}

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {loading && 'Analyzing URL, please wait.'}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-amber hover:bg-amber/90 disabled:bg-white/10 text-background disabled:text-text-secondary font-display font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-background text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <Loader aria-hidden="true" className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap aria-hidden="true" className="w-4 h-4" />
                  <span>Check this link</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Empty State */}
        {!result && !loading && (
          <div
            className="p-5 bg-surface-raised/50 border border-dashed border-white/5 rounded-lg text-center"
            aria-hidden="true"
          >
            <p className="text-text-secondary text-xs">
              Paste a link above. We&rsquo;ll tell you if it&rsquo;s safe &mdash; no sign-up, no spam.
            </p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div
            role="region"
            aria-live="polite"
            aria-label={`Analysis results: ${getStatusText(result.status)}, ${result.confidence}% confidence`}
            className={`rounded-xl border ${getStatusColor(result.status)} p-5 sm:p-6 transform transition-all duration-500 animate-fadeIn`}
          >
            <StatusBadge status={result.status} confidence={result.confidence} />

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Key Findings */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <Eye aria-hidden="true" className="w-5 h-5" />
                  Key Findings
                </h4>
                <div className="space-y-2">
                  {result.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-surface-raised rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 bg-text-secondary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-white/80 leading-relaxed">{reason}</span>
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
                <div className="p-4 bg-surface-raised rounded-lg border border-white/5 space-y-3">
                  <p className="text-white font-medium text-sm">{result.recommendation}</p>
                  <p className="text-sm text-white/60 leading-relaxed">{result.details}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
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
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-text-secondary text-xs leading-relaxed">
            Before you click, check. Jan Suraksha helps you spot phishing and scam links before they reach your inbox, messages, or browser.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SpamLinkChecker;
