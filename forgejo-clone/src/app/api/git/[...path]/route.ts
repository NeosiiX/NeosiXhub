import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { spawn } from "child_process";
import fs from "fs";

async function getRepo(owner: string, repoName: string) {
  const user = await prisma.user.findUnique({ where: { username: owner } });
  const org = !user ? await prisma.organization.findUnique({ where: { name: owner } }) : null;

  return prisma.repository.findFirst({
    where: {
      name: repoName,
      OR: [{ ownerId: user?.id }, { orgId: org?.id }],
    },
    include: { owner: true, org: true },
  });
}

function runGitCommand(service: string, repoPath: string, body: Buffer | null): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const isInfoRefs = service === "info/refs";
    const gitCmd = isInfoRefs ? "upload-pack" : service.replace("git-", "");
    const args = isInfoRefs
      ? ["--stateless-rpc", "--advertise-refs", repoPath]
      : ["--stateless-rpc", repoPath];

    const git = spawn("git", [gitCmd, ...args]);
    const chunks: Buffer[] = [];

    if (!isInfoRefs && body) {
      git.stdin.write(body);
    }
    git.stdin.end();

    git.stdout.on("data", (d: Buffer) => chunks.push(d));
    git.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`git exited with code ${code}`));
    });
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const [owner, repoGit] = params.path;
  const repoName = repoGit?.replace(/\.git$/, "");
  const service = new URL(req.url).searchParams.get("service") || "";

  if (!["git-upload-pack", "git-receive-pack"].includes(service)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const repo = await getRepo(owner, repoName);
  if (!repo || !fs.existsSync(repo.gitPath)) return new NextResponse("Not Found", { status: 404 });

  if (service === "git-receive-pack" || repo.isPrivate) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Basic ")) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="DevHub"' },
      });
    }
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
    const colonIdx = decoded.indexOf(":");
    const username = decoded.slice(0, colonIdx);
    const password = decoded.slice(colonIdx + 1);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { comparePassword } = await import("@/lib/auth");
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return new NextResponse("Unauthorized", { status: 401 });

    if (service === "git-receive-pack") {
      const canPush =
        repo.ownerId === user.id ||
        user.role === "ADMIN" ||
        (await prisma.repoCollaborator.findFirst({
          where: { repoId: repo.id, userId: user.id, permission: { in: ["WRITE", "ADMIN"] } },
        }));
      if (!canPush) return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    const buf = await runGitCommand("info/refs", repo.gitPath, null);
    const svcLine = `# service=${service}\n`;
    const pktLen = (svcLine.length + 4).toString(16).padStart(4, "0");
    const prefix = Buffer.from(`${pktLen}${svcLine}0000`);
    const body = Buffer.concat([prefix, buf]);

    return new NextResponse(body as unknown as BodyInit, {
      headers: { "Content-Type": `application/x-${service}-advertisement` },
    });
  } catch {
    return new NextResponse("Git error", { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const [owner, repoGit, service] = params.path;
  const repoName = repoGit?.replace(/\.git$/, "");

  if (!["git-upload-pack", "git-receive-pack"].includes(service)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const repo = await getRepo(owner, repoName);
  if (!repo) return new NextResponse("Not Found", { status: 404 });

  try {
    const arrayBuffer = await req.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const buf = await runGitCommand(service, repo.gitPath, body);

    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": `application/x-${service}-result` },
    });
  } catch {
    return new NextResponse("Git error", { status: 500 });
  }
}
