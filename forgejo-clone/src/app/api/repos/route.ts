import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { initBareRepo } from "@/lib/git";
import { z } from "zod";
import path from "path";

const schema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/, "Nom invalide"),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  defaultBranch: z.string().default("main"),
  license: z.string().optional(),
  orgId: z.string().optional(),
  initReadme: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // If org repo, check membership
    if (data.orgId) {
      const member = await prisma.orgMember.findFirst({
        where: { orgId: data.orgId, userId: session.id, role: { in: ["OWNER", "ADMIN"] } },
      });
      if (!member) return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 });
    }

    // Check name uniqueness
    const existing = await prisma.repository.findFirst({
      where: data.orgId
        ? { orgId: data.orgId, name: data.name }
        : { ownerId: session.id, name: data.name },
    });
    if (existing) return NextResponse.json({ error: "Un dépôt avec ce nom existe déjà" }, { status: 409 });

    // Compute git path
    const ownerName = data.orgId
      ? (await prisma.organization.findUnique({ where: { id: data.orgId } }))?.name
      : session.username;
    const GIT_ROOT = process.env.GIT_ROOT || "/git-repos";
    const gitPath = path.join(GIT_ROOT, ownerName!, `${data.name}.git`);

    // Init bare git repo
    await initBareRepo(gitPath);

    const repo = await prisma.repository.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        defaultBranch: data.defaultBranch,
        license: data.license,
        gitPath,
        ...(data.orgId ? { orgId: data.orgId } : { ownerId: session.id }),
      },
    });

    return NextResponse.json(repo, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("Create repo error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || 1);

  const repos = await prisma.repository.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        session ? {} : { isPrivate: false },
      ],
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * 20,
    take: 20,
    include: { owner: { select: { username: true, avatarUrl: true } }, org: { select: { name: true, avatarUrl: true } } },
  });

  return NextResponse.json(repos);
}
