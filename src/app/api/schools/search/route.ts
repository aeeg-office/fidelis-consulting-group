import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ schools: [] });
    }

    const schools = await prisma.school.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
        status: { not: "deleted" },
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return NextResponse.json({ schools });
  } catch (error) {
    console.error("School search error:", error);
    return NextResponse.json(
      { error: "Failed to search schools." },
      { status: 500 }
    );
  }
}