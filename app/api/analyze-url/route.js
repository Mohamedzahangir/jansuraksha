import { NextResponse } from 'next/server';
import { logger } from './lib/logger.js';
import { validateAndSanitizeUrl } from './lib/validation.js';
import { parseAiResponse } from './lib/parse.js';
import { serviceUnavailableFallback, emptyResponseFallback } from './lib/fallbacks.js';
import { checkRateLimit, getClientIp } from './lib/rateLimit.js';
import { getCachedResult, setCachedResult, cacheStats } from './lib/cache.js';
import { analyzeWithOpenRouter, OPENROUTER_MODEL } from './lib/openrouter.js';
export const runtime = 'edge';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt for URL analysis
const SYSTEM_PROMPT = `You are a cybersecurity expert specializing in URL analysis and spam detection. Analyze the provided URL and determine if it's potentially spam, malicious, or safe.

Consider these factors:
1. Domain reputation and legitimacy indicators
2. URL structure and suspicious patterns (redirects, shortened URLs, etc.)
3. Common spam/phishing indicators (typosquatting, suspicious TLDs, etc.)
4. SSL/HTTPS security status
5. Known malicious patterns and blacklists
6. Legitimate business indicators

Respond ONLY with a valid JSON object containing:
{
  "status": "safe" | "suspicious" | "dangerous",
  "confidence": 1-100,
  "reasons": ["reason1", "reason2", "reason3", "reason4"],
  "recommendation": "brief actionable recommendation for the user",
  "details": "detailed technical analysis explanation (2-3 sentences)"
}

Be thorough but concise. Focus on actionable security insights. Ensure the confidence score reflects the certainty of your analysis.`;

export async function POST(request) {
  logger.info('API route called');

  const rateLimit = checkRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil(rateLimit.resetInMs / 1000);
    logger.warn('Rate limit exceeded', { retryAfter });
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter} seconds.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.error('Request parsing error', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate and sanitize the URL
    const { ok, url, error } = validateAndSanitizeUrl(body?.url);
    if (!ok) {
      logger.warn('URL validation failed', { url: body?.url, error });
      return NextResponse.json({ error }, { status: 400 });
    }

    logger.info('Analyzing URL', { url });

    // Check API key
    if (!OPENROUTER_API_KEY) {
      logger.error('OpenRouter API key not found');
      return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    const cached = getCachedResult(url);
    if (cached) {
      logger.info('Cache hit', { url });
      return NextResponse.json({ ...cached, cached: true });
    }

    logger.info('Calling OpenRouter API');

    const analysisText = await analyzeWithOpenRouter(
      SYSTEM_PROMPT,
      url,
      OPENROUTER_API_KEY,
      process.env.NEXT_PUBLIC_APP_URL
    );

    let result;
    if (analysisText === null) {
      result = serviceUnavailableFallback(url);
    } else if (analysisText.trim().length === 0) {
      result = emptyResponseFallback(url);
    } else {
      result = parseAiResponse(analysisText, url);
    }

    setCachedResult(url, result);

    logger.info('Analysis completed', { url, status: result.status, confidence: result.confidence });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Unexpected error', error);
    
    // Return a safe fallback response
    return NextResponse.json({
      status: 'suspicious',
      confidence: 50,
      reasons: [
        'Technical error occurred during analysis',
        'Unable to complete full security assessment',
        'Default security protocols applied',
        'Manual verification strongly recommended'
      ],
      recommendation: 'Do not visit this URL until manually verified',
      details: 'A technical error prevented complete analysis of this URL. For your safety, treat this link as potentially suspicious until verified through other means.'
    }, { status: 200 }); // Return 200 with error info instead of 500
  }
}

// Add GET handler for testing
export async function GET() {
  return NextResponse.json({
    message: 'URL Analysis API is running',
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENROUTER_API_KEY,
    model: OPENROUTER_MODEL,
    cache: cacheStats(),
  });
}