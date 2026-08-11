import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generate } from "@/lib/ai-router";
import { isFeatureEnabled, type FeatureFlagCode } from "@/lib/feature-flags";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ tool: string }> }
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestWindows = new Map<string, { count: number; startedAt: number }>();

function withinRateLimit(userId: string) {
  const now = Date.now();
  const record = requestWindows.get(userId);
  if (!record || now - record.startedAt >= WINDOW_MS) { requestWindows.set(userId, { count: 1, startedAt: now }); return true; }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (!withinRateLimit(userId)) return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });

  try {
    const { tool } = await params;
    if (!tool || !/^[a-z0-9-]{2,64}$/.test(tool)) return NextResponse.json({ error: "Invalid AI tool." }, { status: 400 });
    const [user, aiTool] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, schoolId: true, isActive: true } }),
      prisma.aiTool.findUnique({ where: { code: tool }, select: { id: true, isActive: true } }),
    ]);
    if (!user?.isActive) return NextResponse.json({ error: "Account access is unavailable." }, { status: 403 });
    if (!aiTool?.isActive) return NextResponse.json({ error: "This AI tool is unavailable." }, { status: 404 });
    if (!await hasPermission(userId, `ai:${tool}`)) return NextResponse.json({ error: "You do not have access to this AI tool." }, { status: 403 });
    const flag = await isFeatureEnabled(`ai:${tool}` as FeatureFlagCode, { userId, schoolId: user.schoolId ?? undefined });
    if (!flag.enabled) return NextResponse.json({ error: "This AI tool is not enabled for your account." }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.params || typeof body.params !== "object") return NextResponse.json({ error: "A JSON params object is required." }, { status: 400 });
    const language = body.language === "ar" ? "ar" : "en";
    const startedAt = Date.now();
    const result = await generate(tool, body.params as Record<string, unknown>, language);
    await prisma.aiUsageLog.create({ data: { userId, schoolId: user.schoolId, toolId: aiTool.id, modelUsed: result.model, latencyMs: Date.now() - startedAt, success: true, metadata: { cached: result.cached } } });
    return NextResponse.json({ content: result.content, model: result.model, cached: result.cached });
  } catch (error) {
    console.error("AI generation request failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "AI generation could not be completed. Please try again." }, { status: 502 });
  }
}
