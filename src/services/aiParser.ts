const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Store API key in localStorage so users don't need to re-enter
function getApiKey(): string | null {
  return localStorage.getItem('claude_api_key');
}

export function setApiKey(key: string): void {
  localStorage.setItem('claude_api_key', key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export function clearApiKey(): void {
  localStorage.removeItem('claude_api_key');
}

interface ParsedFoodInfo {
  name: string;
  address: string;
  recommendedDishes: string[];
  avgPrice: number | null;
  notes: string;
}

const PARSE_PROMPT = `你是一个美食攻略整理助手。请从以下 OCR 识别出的文本中，提取美食相关信息。

OCR 识别的文本可能包含错别字、换行混乱、多余符号，请你智能纠错和整理。

请返回严格的 JSON 格式（不要包含其他文字）:
{
  "name": "餐厅/小吃店名称",
  "address": "地址（如果有的话，否则留空字符串）",
  "recommendedDishes": ["推荐菜1", "推荐菜2"],
  "avgPrice": 人均价格数字（没有则为null）,
  "notes": "其他备注信息（排队tips、营业时间、注意事项等，没有则留空字符串）"
}

OCR 识别文本:
{{OCR_TEXT}}

请只返回 JSON，不要包含任何其他内容。`;

export async function parseFoodInfo(
  ocrText: string
): Promise<ParsedFoodInfo> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先设置 Claude API Key');
  }

  const prompt = PARSE_PROMPT.replace('{{OCR_TEXT}}', ocrText);

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`AI 请求失败 (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  // Extract JSON from response (handle possible markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 返回格式异常，请重试');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      name: parsed.name || '',
      address: parsed.address || '',
      recommendedDishes: Array.isArray(parsed.recommendedDishes)
        ? parsed.recommendedDishes
        : [],
      avgPrice: typeof parsed.avgPrice === 'number' ? parsed.avgPrice : null,
      notes: parsed.notes || '',
    };
  } catch {
    throw new Error('AI 返回 JSON 解析失败，请重试');
  }
}
