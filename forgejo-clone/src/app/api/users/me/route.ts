import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, email: true, displayName: true, bio: true, location: true, websiteUrl: true, twitterHandle: true, avatarUrl: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(user);
}

const patchSchema = z.object({
  displayName: z.string().max(60).optional(),
  bio: z.string().max(300).optional(),
  location: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  twitterHandle: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        displayName: data.displayName || null,
        bio: data.bio || null,
        location: data.location || null,
        websiteUrl: data.websiteUrl || null,
        twitterHandle: data.twitterHandle || null,
        avatarUrl: data.avatarUrl || null,
      },
      select: { id: true, username: true, displayName: true, bio: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
