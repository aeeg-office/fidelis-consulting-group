/**
 * Fidelis AI Routing Engine
 *
 * Routes requests to the optimal OpenRouter model based on tool type,
 * with in-memory response caching, automatic fallback, and usage logging.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIGenerateParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateResult {
  content: string;
  model: string;
  cached: boolean;
}

// ─── Model Configuration ─────────────────────────────────────────────────────

type ToolCategory = "planning" | "creative" | "analysis";

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  fallback: string;
}

const MODEL_MAP: Record<ToolCategory, ModelConfig> = {
  planning: {
    model: "deepseek/deepseek-v4-flash",
    temperature: 0.7,
    maxTokens: 2048,
    fallback: "openai/o4-mini",
  },
  creative: {
    model: "openai/o4-mini",
    temperature: 0.9,
    maxTokens: 3072,
    fallback: "deepseek/deepseek-v4-flash",
  },
  analysis: {
    model: "openai/o4-mini",
    temperature: 0.3,
    maxTokens: 4096,
    fallback: "deepseek/deepseek-v4-flash",
  },
};

/**
 * Map tool codes to categories.
 * Extend this map as new tools are added.
 */
const TOOL_CATEGORY: Record<string, ToolCategory> = {
  // Planning tools
  "lesson-planner": "planning",
  "unit-planner": "planning",
  "learning-objectives": "planning",
  "success-criteria": "planning",
  "homework-generator": "planning",
  "exit-tickets": "planning",

  // Creative / resource creation tools
  "worksheet-builder": "creative",
  "reading-passage": "creative",
  "writing-prompts": "creative",
  "parent-letter": "creative",
  "professional-email": "creative",
  "meeting-agenda": "creative",

  // Analysis / assessment tools
  "quiz-builder": "analysis",
  "assessment-generator": "analysis",
  "rubric-builder": "analysis",
  "writing-feedback": "analysis",
  "grammar-analysis": "analysis",
  "student-feedback": "analysis",
  "differentiation": "analysis",
  "dept-report": "analysis",
  "dept-improvement": "analysis",
};

function getToolCategory(toolCode: string): ToolCategory {
  return TOOL_CATEGORY[toolCode] ?? "planning";
}

// ─── Response Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  content: string;
  model: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Default TTL: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

function buildCacheKey(toolCode: string, params: Record<string, unknown>, language?: string): string {
  return `${toolCode}:${JSON.stringify(params)}:${language ?? "en"}`;
}

function getFromCache(key: string): AIGenerateResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return { content: entry.content, model: entry.model, cached: true };
}

function setCache(key: string, content: string, model: string): void {
  // Auto-evict when cache exceeds 500 entries
  if (cache.size >= 500) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { content, model, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Usage Logging ───────────────────────────────────────────────────────────

interface UsageLogEntry {
  toolCode: string;
  model: string;
  cached: boolean;
  timestamp: string;
  params: Record<string, unknown>;
  language?: string;
}

function logUsage(entry: UsageLogEntry): void {
  // TODO: Persist to DB via Prisma in production
  console.log("[AI Router]", JSON.stringify(entry));
}

// ─── OpenRouter API Call ─────────────────────────────────────────────────────

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env file."
    );
  }
  return key;
}

async function callOpenRouter(params: AIGenerateParams, model: string): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://fidelisconsultingroup.com",
      "X-Title": "Fidelis AI Platform",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return content;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate AI content for a given tool.
 *
 * @param toolCode - The tool identifier (e.g. "lesson-planner", "quiz-builder")
 * @param params - Tool-specific parameters
 * @param language - Optional language code (defaults to "en")
 * @returns The generated content, model used, and cache status
 */
export async function generate(
  toolCode: string,
  params: Record<string, unknown>,
  language?: string
): Promise<AIGenerateResult> {
  const { generateWithPrompt } = await import("./ai-prompt-templates");
  const { systemPrompt, userPrompt } = generateWithPrompt(toolCode, params, language);

  // Check cache
  const cacheKey = buildCacheKey(toolCode, params, language);
  const cached = getFromCache(cacheKey);
  if (cached) {
    logUsage({ toolCode, model: cached.model, cached: true, timestamp: new Date().toISOString(), params, language });
    return cached;
  }

  const category = getToolCategory(toolCode);
  const config = MODEL_MAP[category];

  let lastError: Error | null = null;
  let modelUsed = config.model;

  // Try primary model
  try {
    const content = await callOpenRouter(
      { systemPrompt, userPrompt, temperature: config.temperature, maxTokens: config.maxTokens },
      config.model
    );
    setCache(cacheKey, content, config.model);
    logUsage({ toolCode, model: config.model, cached: false, timestamp: new Date().toISOString(), params, language });
    return { content, model: config.model, cached: false };
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    console.warn(`[AI Router] Primary model ${config.model} failed:`, lastError.message);
  }

  // Try fallback model
  try {
    modelUsed = config.fallback;
    const content = await callOpenRouter(
      { systemPrompt, userPrompt, temperature: config.temperature, maxTokens: config.maxTokens },
      config.fallback
    );
    setCache(cacheKey, content, config.fallback);
    logUsage({ toolCode, model: config.fallback, cached: false, timestamp: new Date().toISOString(), params, language });
    return { content, model: config.fallback, cached: false };
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    console.warn(`[AI Router] Fallback model ${config.fallback} failed:`, lastError.message);
  }

  // Both models failed
  throw new Error(
    `AI generation failed for tool "${toolCode}" after trying both primary and fallback models. Last error: ${lastError?.message}`
  );
}