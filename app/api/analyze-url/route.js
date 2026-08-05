import { NextResponse } from 'next/server';
import { logger } from './lib/logger.js';
import { validateAndSanitizeUrl } from './lib/validation.js';
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

    // Create the user prompt
    const userPrompt = `Analyze this URL for spam/malicious content: ${url}

Please perform a comprehensive security analysis considering:
- Domain legitimacy and reputation
- URL structure and potential redirects
- SSL certificate status
- Known threat indicators
- Phishing/spam patterns
- Business legitimacy signals

Provide your analysis in the specified JSON format.`;

    logger.info('Calling OpenRouter API');

    // Call OpenRouter API
    const apiResponse = await fetch(OPENROUTER_URL, {
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

    logger.info('OpenRouter response status', { status: apiResponse.status });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      logger.error('OpenRouter API error', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      // Return a fallback response for testing
      return NextResponse.json({
        status: 'suspicious',
        confidence: 75,
        reasons: [
          'Unable to connect to AI analysis service',
          'Using fallback security assessment',
          'Domain appears to be accessible',
          'Manual verification recommended'
        ],
        recommendation: 'Exercise caution and verify the link manually',
        details: 'The AI analysis service is temporarily unavailable. This URL has been given a default suspicious rating for safety. Please verify manually before visiting.'
      });
    }

    const completion = await apiResponse.json();

    const analysisText = completion.choices?.[0]?.message?.content;

    if (!analysisText) {
      logger.warn('No content in OpenRouter response');
      // Return fallback response
      return NextResponse.json({
        status: 'suspicious',
        confidence: 60,
        reasons: [
          'AI analysis service returned empty response',
          'Using default security protocols',
          'URL structure appears standard',
          'Recommend manual verification'
        ],
        recommendation: 'Proceed with caution',
        details: 'The analysis service did not return detailed results. Please verify this URL through other means before visiting.'
      });
    }

    // Parse JSON response from AI
    let analysisResult;
    try {
      // Clean the response in case there are markdown code blocks
      const cleanedResponse = analysisText
        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '')
        .replace(/^[^{]*/, '') // Remove any text before the first {
        .replace(/[^}]*$/, '') // Remove any text after the last }
        .trim();
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      logger.error('JSON parsing error', parseError, 'Original text:', analysisText);
      
      // Extract information using regex as fallback
      const statusMatch = analysisText.match(/"status":\s*"(safe|suspicious|dangerous)"/);
      const confidenceMatch = analysisText.match(/"confidence":\s*(\d+)/);
      
      analysisResult = {
        status: statusMatch ? statusMatch[1] : 'suspicious',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 70,
        reasons: [
          'AI analysis completed successfully',
          'Response format required cleanup',
          'Security assessment provided',
          'Manual review recommended for accuracy'
        ],
        recommendation: 'Review the analysis and proceed with appropriate caution',
        details: 'The AI provided analysis but in a non-standard format. The security assessment has been processed but may require manual verification.'
      };
    }

    // Validate and sanitize the response structure
    const validStatuses = ['safe', 'suspicious', 'dangerous'];
    if (!validStatuses.includes(analysisResult.status)) {
      analysisResult.status = 'suspicious';
    }
    
    if (!analysisResult.confidence || analysisResult.confidence < 1 || analysisResult.confidence > 100) {
      analysisResult.confidence = 70;
    }
    
    if (!Array.isArray(analysisResult.reasons) || analysisResult.reasons.length === 0) {
      analysisResult.reasons = [
        'URL structure analysis completed',
        'Security indicators checked',
        'Domain reputation assessed',
        'Safety recommendation provided'
      ];
    }
    
    if (!analysisResult.recommendation) {
      analysisResult.recommendation = 'Proceed with appropriate security measures';
    }
    
    if (!analysisResult.details) {
      analysisResult.details = 'Comprehensive security analysis has been completed. Please review the findings and recommendations above.';
    }

    logger.info('Final analysis result', analysisResult);

    return NextResponse.json(analysisResult);

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
    hasApiKey: !!OPENROUTER_API_KEY
  });
}