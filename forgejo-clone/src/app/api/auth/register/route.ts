import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signToken, setAuthCookie } from "@/lib/session";
import { initBareRepo } from "@/lib/git";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(2).max(39).regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement"),
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = schema.parse(body);

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] },
    });
    if (existing) {
      const field = existing.username === username.toLowerCase() ? "username" : "email";
      return NextResponse.json({ error: `Ce ${field} est déjà utilisé` }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    // First user becomes admin
    const isFirst = (await prisma.user.count()) === 0;

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        displayName: username,
        role: isFirst ? "ADMIN" : "USER",
      },
    });

    const token = await signToken({ id: user.id, username: user.username, role: user.role });
    const response = NextResponse.json({ ok: true, username: user.username }, { status: 201 });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
