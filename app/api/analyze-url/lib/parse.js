import { runHeuristics } from './heuristics.js';
import { parseFallback } from './fallbacks.js';

const VALID_STATUSES = ['safe', 'suspicious', 'dangerous'];

function cleanAiText(text) {
  return text
    .replace(/```json\n?/gi, '')
    .replace(/\n?```/g, '')
    .replace(/^[^{]*/, '')
    .replace(/[^}]*$/, '')
    .trim();
}

function extractWithRegex(text, url) {
  const statusMatch = text.match(/"status":\s*"(safe|suspicious|dangerous)"/);
  const confidenceMatch = text.match(/"confidence":\s*(\d+)/);

  if (!statusMatch && !confidenceMatch) {
    return parseFallback(url);
  }

  return normalizeResult(
    {
      status: statusMatch ? statusMatch[1] : 'suspicious',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1], 10) : 70,
    },
    url
  );
}

export function parseAiResponse(text, url) {
  if (!text || !text.trim()) {
    return parseFallback(url);
  }

  try {
    const cleaned = cleanAiText(text);
    const parsed = JSON.parse(cleaned);
    return normalizeResult(parsed, url);
  } catch {
    return extractWithRegex(text, url);
  }
}

export function normalizeResult(input, url) {
  const heuristic = runHeuristics(url);
  const result = {};

  result.status = VALID_STATUSES.includes(input.status) ? input.status : 'suspicious';

  const confidence = Number(input.confidence);
  result.confidence = Number.isFinite(confidence)
    ? Math.min(100, Math.max(1, Math.round(confidence)))
    : 70;

  let reasons = [];
  if (Array.isArray(input.reasons)) {
    reasons = input.reasons
      .filter((reason) => typeof reason === 'string' && reason.trim().length > 0)
      .map((reason) => reason.trim());
  }

  const heuristicSignals = heuristic.signals.map((signal) => signal.label);
  if (reasons.length < 2) {
    reasons = [...reasons, ...heuristicSignals].slice(0, 4);
  }
  result.reasons = reasons.length > 0 ? reasons.slice(0, 4) : ['Security analysis completed'];

  result.recommendation =
    typeof input.recommendation === 'string' && input.recommendation.trim()
      ? input.recommendation.trim()
      : 'Proceed with appropriate security measures';

  result.details =
    typeof input.details === 'string' && input.details.trim()
      ? input.details.trim()
      : 'Comprehensive security analysis has been completed. Please review the findings and recommendations above.';

  return result;
}
