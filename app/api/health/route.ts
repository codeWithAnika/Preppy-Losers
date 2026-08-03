import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();

  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").select("id").limit(1);

    const durationMs = Date.now() - started;

    if (error) {
      logger.error("system", "Health check database probe failed", error, {
        path: "/api/health",
        method: "GET",
        durationMs,
      });

      return NextResponse.json(
        {
          status: "degraded",
          checks: {
            database: "error",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    logger.apiRequest({
      method: "GET",
      path: "/api/health",
      statusCode: 200,
      durationMs,
    });

    return NextResponse.json({
      status: "ok",
      checks: {
        database: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("system", "Health check failed", error, {
      path: "/api/health",
      method: "GET",
    });

    return NextResponse.json(
      {
        status: "error",
        checks: {
          database: "unreachable",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
