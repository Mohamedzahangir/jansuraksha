const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'secure', 'update', 'account', 'confirm',
  'wallet', 'prize', 'reward', 'winner', 'urgent', 'bonus', 'free',
];

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.zip', '.mov', '.click', '.link',
];

export function runHeuristics(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      status: 'dangerous',
      score: 90,
      signals: [{ label: 'Malformed URL', good: false }],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const full = parsed.toString().toLowerCase();
  const hostParts = hostname.split('.').filter(Boolean);

  const signals = [];
  let score = 0;

  if (parsed.protocol === 'https:') {
    signals.push({ label: 'Uses HTTPS encryption', good: true });
  } else {
    score += 15;
    signals.push({ label: 'Uses unencrypted HTTP', good: false });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 25;
    signals.push({ label: 'Domain is a raw IP address', good: false });
  }

  if (parsed.username || parsed.password) {
    score += 20;
    signals.push({ label: 'URL contains embedded credentials', good: false });
  }

  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    score += 20;
    signals.push({ label: 'Domain uses a frequently abused TLD', good: false });
  }

  const keywordHits = SUSPICIOUS_KEYWORDS.filter((keyword) => full.includes(keyword));
  if (keywordHits.length > 0) {
    score += Math.min(15, keywordHits.length * 5);
    signals.push({
      label: `Contains suspicious keyword${keywordHits.length > 1 ? 's' : ''}: ${keywordHits.slice(0, 3).join(', ')}`,
      good: false,
    });
  }

  if (hostParts.length >= 5) {
    score += 10;
    signals.push({ label: 'Unusually deep subdomain structure', good: false });
  }

  if (full.length > 500) {
    score += 10;
    signals.push({ label: 'URL is unusually long', good: false });
  }

  score = Math.min(100, Math.max(0, score));
  const status = score >= 45 ? 'dangerous' : score >= 20 ? 'suspicious' : 'safe';

  return { status, score, signals };
}
