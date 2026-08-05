import { NextResponse } from 'next/server';
import { logger } from './lib/logger.js';
import { validateAndSanitizeUrl } from './lib/validation.js';
import { parseAiResponse } from './lib/parse.js';
import { serviceUnavailableFallback, emptyResponseFallback } from './lib/fallbacks.js';
export const runtime = 'edge';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
    const { ok, url, error } = validateAndSanitizeUrl(body?.url);    if (!ok) {
      logger.warn('URL validation failed', { url: body?.url, error });
      return NextResponse.json({ error }, { status: 400 });
    }

    logger.info('Analyzing URL', { url });

    // Check API key
    if (!OPENROUTER_API_KEY) {
      logger.error('OpenRouter API key not found');
      return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
    }

    logger.info('Calling OpenRouter API');

    const analysisText = await analyzeWithOpenRouter(url);

    let result;
    if (analysisText === null) {
      result = serviceUnavailableFallback(url);
    } else if (analysisText.trim().length === 0) {
      result = emptyResponseFallback(url);
    } else {
      result = parseAiResponse(analysisText, url);
    }

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

// Calls the OpenRouter API and returns:
//  - null when the request failed (network or HTTP error)
//  - an empty string when the response contained no analysis
//  - the raw analysis text otherwise
async function analyzeWithOpenRouter(url) {
  const userPrompt = `Analyze this URL for spam/malicious content: ${url}

Please perform a comprehensive security analysis considering:
- Domain legitimacy and reputation
- URL structure and potential redirects
- SSL certificate status
- Known threat indicators
- Phishing/spam patterns
- Business legitimacy signals

Provide your analysis in the specified JSON format.`;

  let apiResponse;
  try {
    apiResponse = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Spam Link Checker',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:freee', // Using faster/cheaper model for testing
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });
  } catch (fetchError) {
    logger.error('Network error calling OpenRouter', fetchError);
    return null;
  }

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    logger.error('OpenRouter API error', {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      error: errorText
    });
    return null;
  }

  const completion = await apiResponse.json();
  return completion.choices?.[0]?.message?.content ?? '';
}

// Add GET handler for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'URL Analysis API is running',
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENROUTER_API_KEY
  });
}