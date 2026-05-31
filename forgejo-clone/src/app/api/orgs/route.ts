import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(39).regex(/^[a-zA-Z0-9_-]+$/, "Nom invalide"),
  displayName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  isPublic: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.organization.findUnique({ where: { name: data.name.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "Ce nom d'organisation est déjà utilisé" }, { status: 409 });

    // Also check if a user has this username
    const userExists = await prisma.user.findUnique({ where: { username: data.name.toLowerCase() } });
    if (userExists) return NextResponse.json({ error: "Ce nom est déjà utilisé par un compte utilisateur" }, { status: 409 });

    const org = await prisma.organization.create({
      data: {
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description,
        websiteUrl: data.websiteUrl || null,
        location: data.location,
        isPublic: data.isPublic,
        members: {
          create: { userId: session.id, role: "OWNER" },
        },
      },
    });

    return NextResponse.json(org, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("Create org error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
