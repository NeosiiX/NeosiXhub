import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const existing = await prisma.star.findUnique({
    where: { userId_repoId: { userId: session.id, repoId: params.id } },
  });

  if (existing) {
    await prisma.star.delete({ where: { userId_repoId: { userId: session.id, repoId: params.id } } });
    await prisma.repository.update({ where: { id: params.id }, data: { starsCount: { decrement: 1 } } });
    return NextResponse.json({ starred: false });
  } else {
    await prisma.star.create({ data: { userId: session.id, repoId: params.id } });
    await prisma.repository.update({ where: { id: params.id }, data: { starsCount: { increment: 1 } } });
    return NextResponse.json({ starred: true });
  }
}
