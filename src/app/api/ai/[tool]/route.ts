import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/ai-router";

// ─── Route Context ───────────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ tool: string }>;
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tool } = await params;

    // Validate tool code
    if (!tool || typeof tool !== "string" || tool.trim().length === 0) {
      return NextResponse.json(
        { error: "Tool code is required in the URL path." },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object with at least a 'params' field." },
        { status: 400 }
      );
    }

    const { params: toolParams, language } = body;

    if (!toolParams || typeof toolParams !== "object") {
      return NextResponse.json(
        { error: "'params' field is required and must be an object." },
        { status: 400 }
      );
    }

    // Call the AI router
    const result = await generate(tool, toolParams, language ?? "en");

    // Return the result
    return NextResponse.json({
      content: result.content,
      model: result.model,
      cached: result.cached,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";

    console.error(`[AI API] Error generating for tool:`, error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ─── OPTIONS Handler (CORS for future extension) ─────────────────────────────

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}