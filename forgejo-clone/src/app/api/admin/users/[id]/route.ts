import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const patchSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    // Prevent self-demotion
    if (params.id === session.id && data.role === "USER") {
      return NextResponse.json({ error: "Vous ne pouvez pas vous rétrograder" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, username: true, role: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    console.error("Admin user patch error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  if (params.id === session.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte depuis l'admin" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
