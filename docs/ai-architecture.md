# FIDELIS CONSULTING GROUP
## AI Architecture & OpenRouter Routing Strategy v1.0

---

### 1. DESIGN PHILOSOPHY

The AI platform is NOT a chatbot. It is a suite of structured productivity tools that happen to use AI under the hood. Every tool presents:
- Structured forms with preset menus and dropdowns
- Contextual help and tooltips
- One-click refinement buttons
- Optional conversational refinement (expandable text area)

Teachers never write prompts. The prompt is constructed by the system from structured inputs.

### 2. OPENROUTER ROUTING STRATEGY

**Core Principle:** Use the cheapest model that delivers acceptable quality. Escalate cost only when the task requires it.

```yaml
Routing Strategy:
  default_model: "deepseek/deepseek-v4-flash"
  default_fallback: "openai/o4-mini"
  premium_model: "anthropic/claude-sonnet-4.6"
  premium_fallback: "openai/o4-mini"
  
  cost_optimization:
    cache_ttl: 3600         # 1 hour cache for identical requests
    retry_attempts: 2        # auto-retry on failure with fallback
    rate_limit_rpm: 60       # per-user rate limit
    batch_if_possible: true  # batch multiple tool calls into one API call
```

### 3. MODEL SELECTION MATRIX

| Task Category | Recommended Model | Fallback | Rationale |
|---------------|------------------|----------|-----------|
| **Lesson Planning** | deepseek/deepseek-v4-flash | openai/o4-mini | Structured output, no creative writing needed |
| **Unit Planning** | deepseek/deepseek-v4-flash | openai/o4-mini | Template-based, predictable |
| **Worksheet Builder** | deepseek/deepseek-v4-flash | openai/o4-mini | Structured content |
| **Reading Passage** | openai/o4-mini | deepseek/deepseek-v4-flash | Needs narrative coherence |
| **Writing Prompts** | openai/o4-mini | deepseek/deepseek-v4-flash | Creative, needs quality |
| **Quiz Builder** | deepseek/deepseek-v4-flash | openai/o4-mini | Factual, structured |
| **Assessment Generator** | deepseek/deepseek-v4-flash | openai/o4-mini | Template-driven |
| **Rubric Builder** | deepseek/deepseek-v4-flash | openai/o4-mini | Highly structured |
| **Learning Objectives** | deepseek/deepseek-v4-flash | openai/o4-mini | Formulaic (Bloom's taxonomy) |
| **Success Criteria** | deepseek/deepseek-v4-flash | openai/o4-mini | Formulaic |
| **Homework Generator** | deepseek/deepseek-v4-flash | openai/o4-mini | Template-based |
| **Differentiation** | openai/o4-mini | deepseek/deepseek-v4-flash | Needs reasoning |
| **Exit Tickets** | deepseek/deepseek-v4-flash | openai/o4-mini | Simple, structured |
| **Parent Letters** | deepseek/deepseek-v4-flash | openai/o4-mini | Template with personalization |
| **Professional Email** | deepseek/deepseek-v4-flash | openai/o4-mini | Template with personalization |
| **Meeting Agenda** | deepseek/deepseek-v4-flash | openai/o4-mini | Structured |
| **Department Report** | openai/o4-mini | anthropic/claude-sonnet-4.6 | Longer, needs analysis |
| **Dept Improvement** | openai/o4-mini | anthropic/claude-sonnet-4.6 | Strategic thinking |
| **Writing Feedback** | openai/o4-mini | deepseek/deepseek-v4-flash | Needs nuance |
| **Grammar Analysis** | deepseek/deepseek-v4-flash | openai/o4-mini | Rule-based, cheap |
| **Student Feedback** | deepseek/deepseek-v4-flash | openai/o4-mini | Template with personalization |

### 4. PROMPT TEMPLATE ARCHITECTURE

```
Every tool uses a structured prompt template system:

TEMPLATE STRUCTURE:
  system_prompt:    Tool-specific instructions + output format (JSON schema)
  context:          School/curriculum/user preferences (if available)
  input:            Form fields converted to structured prompt
  output_format:    JSON schema defining the response structure
  refinement:      Optional follow-up parameters for one-click refinement

EXAMPLE — Lesson Planner:

  system_prompt: >
    You are a professional lesson planning assistant for international
    school teachers. Generate a complete lesson plan based on the
    provided parameters. Output in JSON format matching the schema.
    Language: {output_language}

  input_schema:
    topic: string
    grade_level: enum (K-12)
    duration_minutes: integer
    curriculum: enum (IGCSE, IB, American, British)
    differentiation: boolean
    resources: string[]

  output_schema:
    lesson_title: string
    learning_objectives: string[]
    materials: string[]
    lesson_structure: [{section, duration, activity, teacher_actions}]
    differentiation_notes: [{group, strategy}]
    assessment: string
    homework: string
```

### 5. CACHING STRATEGY

```typescript
interface CacheStrategy {
  // Identical requests (same inputs, same user) are cached for 1 hour
  // Cache key: tool_code + hash(inputs) + language
  // Cache store: Redis (Upstash)
  // Cache invalidation: TTL-based, or manual admin clear
  
  level1: "in-memory"      // 5-minute TTL for identical consecutive requests
  level2: "redis"           // 1-hour TTL for repeat requests
  level3: "database"        // Per-user tool history (last 30 days)
}
```

### 6. AI COST MANAGEMENT

```typescript
interface CostManagement {
  // Per-user monthly quota (configurable via subscription plan)
  monthly_quota: {
    teacher_basic: 500,        // API calls per month
    teacher_pro: 2000,
    teacher_unlimited: -1,     // unlimited
    school_starter: 1000,      // per teacher
    school_pro: 5000,          // per teacher
    school_enterprise: -1,     // unlimited
  }
  
  // Cost tracking per tool
  cost_tracking: {
    log_every_call: true,
    estimate_before: true,     // Show user cost estimate before generation
    monthly_report: true,      // Email monthly usage report to school admin
    per_tool_analytics: true,  // Which tools consume most credits
  }
  
  // Cost optimization
  optimization: {
    cache_hit_rate_target: 0.4,    // 40% cache hit rate
    fallback_on_timeout: true,     // Retry with cheaper model on timeout
    batch_operations: true,        // Batch multiple generations
    compress_history: true,        // Truncate conversation history for cost
  }
}
```

### 7. API FLOW

```
User submits form
  → Backend validates inputs
  → Check cache (hash of inputs + tool code)
    → Cache HIT: return cached result
    → Cache MISS: continue
  → Check user quota (credits remaining)
    → Quota exceeded: return error with upgrade prompt
    → Quota available: continue
  → Build prompt from template + inputs
  → Call OpenRouter (primary model)
    → Success: parse response, cache, log usage, return
    → Error/Timeout: attempt fallback model
      → Success: log fallback usage, return
      → Error: return user-friendly error
  → Log AI usage (cost, tokens, latency, model)
  → Decrement user credits
```

### 8. SCALABLE PROMPT TEMPLATES

Each AI tool has a dedicated prompt template file stored in `/api/ai/prompts/{tool_code}.ts`. This allows:
- Independent editing of each tool's prompt
- A/B testing different prompt strategies
- Versioning prompts for rollback
- Per-language prompt variants (EN/AR)

### 9. FUTURE-PROOFING

- **Model upgrades**: Changing a model per tool is a config change, not a code change
- **New tools**: Add new tool via DB entry + prompt template + feature flag
- **Tool chain**: Future ability to chain tools (Lesson Planner → Worksheet Builder using lesson plan context)
- **Batch mode**: School admin can generate materials for all teachers at once
- **Arabic output**: Prompt templates include language parameter; Arabic prompts use different phrasing, not just translation