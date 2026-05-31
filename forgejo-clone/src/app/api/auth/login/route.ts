import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { signToken, setAuthCookie } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = schema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: login.toLowerCase() },
          { email: login.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, username: user.username, role: user.role });

    const response = NextResponse.json({ ok: true, username: user.username });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
