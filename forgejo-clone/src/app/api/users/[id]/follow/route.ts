import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.id === params.id) return NextResponse.json({ error: "Vous ne pouvez pas vous suivre vous-même" }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.id, followingId: params.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId: session.id, followingId: params.id } } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId: session.id, followingId: params.id } });
    return NextResponse.json({ following: true });
  }
}
