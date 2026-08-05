import { runHeuristics } from './heuristics.js';

const FALLBACK_RECOMMENDATION = 'Exercise caution and verify the link manually';

function confidenceFor(heuristic) {
  if (heuristic.status === 'dangerous') return 85;
  if (heuristic.status === 'suspicious') return 70;
  return 55;
}

function buildFallback(heuristic, { reasons, recommendation, details }) {
  const signalLabels = heuristic.signals.slice(0, 3).map((signal) => signal.label);
  const merged = [...reasons, ...signalLabels].slice(0, 4);

  return {
    status: heuristic.status === 'safe' ? 'suspicious' : heuristic.status,
    confidence: confidenceFor(heuristic),
    reasons: merged.length > 0 ? merged : ['No clear security signals detected', 'Manual verification recommended'],
    recommendation,
    details,
  };
}

export function serviceUnavailableFallback(url) {
  const heuristic = runHeuristics(url);
  return buildFallback(heuristic, {
    reasons: ['Unable to connect to AI analysis service', 'Applied local heuristic scan'],
    recommendation: FALLBACK_RECOMMENDATION,
    details: 'The AI analysis service is temporarily unavailable. A local heuristic scan was applied instead; please verify manually before visiting.',
  });
}

export function emptyResponseFallback(url) {
  const heuristic = runHeuristics(url);
  return buildFallback(heuristic, {
    reasons: ['AI analysis returned no content', 'Applied local heuristic scan'],
    recommendation: 'Proceed with caution',
    details: 'The analysis service did not return detailed results. A local heuristic scan was applied; please verify this URL through other means before visiting.',
  });
}

export function parseFallback(url) {
  const heuristic = runHeuristics(url);
  return buildFallback(heuristic, {
    reasons: ['AI response format required cleanup', 'Heuristic signals considered'],
    recommendation: 'Review the analysis and proceed with appropriate caution',
    details: 'The AI provided analysis in a non-standard format. The security assessment has been processed but may require manual verification.',
  });
}
