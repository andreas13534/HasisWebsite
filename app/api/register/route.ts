import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import {
  createRateLimitMiddleware,
  rateLimitResponse,
} from "@/lib/rate-limit-middleware";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50).optional(),
  password: z.string().min(8).max(100),
});

// Rate Limiting: Max 5 Registrierungen pro Stunde pro IP
const registerRateLimit = createRateLimitMiddleware(5, 60 * 60 * 1000);

export async function POST(req: Request) {
  // Rate Limiting Check
  const rateLimitResult = registerRateLimit(req);
  if (rateLimitResult) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe" },
        { status: 400 },
      );
    }

    const { email, name, password } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "E-Mail ist bereits registriert" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}

