import { logger } from './logger.js';

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3.1:freee';

export function buildUserPrompt(url) {
  return `Analyze this URL for spam/malicious content: ${url}

Please perform a comprehensive security analysis considering:
- Domain legitimacy and reputation
- URL structure and potential redirects
- SSL certificate status
- Known threat indicators
- Phishing/spam patterns
- Business legitimacy signals

Provide your analysis in the specified JSON format.`;
}

export async function analyzeWithOpenRouter(systemPrompt, url, apiKey, appUrl) {
  let apiResponse;
  try {
    apiResponse = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appUrl || 'http://localhost:3000',
        'X-Title': 'Spam Link Checker',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserPrompt(url) },
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
      error: errorText,
    });
    return null;
  }

  const completion = await apiResponse.json();
  return completion.choices?.[0]?.message?.content ?? '';
}
