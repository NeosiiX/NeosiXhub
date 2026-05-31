import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getRepoInfo } from "@/lib/git";
import Link from "next/link";
import { GitBranch, Star, GitFork, Eye, Lock, Globe, Code, AlertCircle, Tag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTree } from "@/components/repo/FileTree";
import { ReadmeViewer } from "@/components/repo/ReadmeViewer";
import { CloneWidget } from "@/components/repo/CloneWidget";

export async function generateMetadata({ params }: { params: { username: string; repo: string } }) {
  return { title: `${params.username}/${params.repo}` };
}

export default async function RepoPage({ params }: { params: { username: string; repo: string } }) {
  const session = await getSession();

  // Find owner (user or org)
  const user = await prisma.user.findUnique({ where: { username: params.username } });
  const org = !user ? await prisma.organization.findUnique({ where: { name: params.username } }) : null;

  const repo = await prisma.repository.findFirst({
    where: {
      name: params.repo,
      OR: [
        { ownerId: user?.id },
        { orgId: org?.id },
      ],
    },
    include: {
      owner: true,
      org: true,
      _count: { select: { stars: true, forks: true, issues: true } },
    },
  });

  if (!repo) notFound();

  // Private repo — check access
  if (repo.isPrivate) {
    if (!session) notFound();
    const hasAccess = repo.ownerId === session.id
      || (repo.orgId && await prisma.orgMember.findFirst({ where: { orgId: repo.orgId, userId: session.id } }))
      || await prisma.repoCollaborator.findFirst({ where: { repoId: repo.id, userId: session.id } });
    if (!hasAccess) notFound();
  }

  const isOwner = session && (repo.ownerId === session.id || session.role === "ADMIN");
  const isStarred = session ? await prisma.star.findUnique({
    where: { userId_repoId: { userId: session.id, repoId: repo.id } }
  }) : null;

  // Git info
  const gitInfo = await getRepoInfo(repo.gitPath).catch(() => null);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30">
        <div className="container max-w-6xl px-4 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm mb-3">
            <Link href={`/${params.username}`} className="text-primary hover:underline font-medium">
              {params.username}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-bold">{repo.name}</span>
            {repo.isPrivate ? (
              <Badge variant="outline" className="ml-2 gap-1"><Lock className="h-3 w-3" />Privé</Badge>
            ) : (
              <Badge variant="outline" className="ml-2 gap-1"><Globe className="h-3 w-3" />Public</Badge>
            )}
            {repo.isArchived && <Badge variant="secondary" className="ml-1">Archivé</Badge>}
          </div>

          {/* Description */}
          {repo.description && (
            <p className="text-muted-foreground text-sm mb-3">{repo.description}</p>
          )}

          {/* Topics */}
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {repo.topics.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <StarButton repoId={repo.id} isStarred={!!isStarred} count={repo._count.stars} />
            <Button variant="outline" size="sm" className="gap-2">
              <GitFork className="h-4 w-4" />
              Forker
              <span className="text-muted-foreground text-xs">{repo._count.forks}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Watch
              <span className="text-muted-foreground text-xs">{repo.watchersCount}</span>
            </Button>
            {isOwner && (
              <Link href={`/${params.username}/${params.repo}/settings`} className="ml-auto">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-4">
        <Tabs defaultValue="code">
          <TabsList className="mb-4">
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-3.5 w-3.5" />Code
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Issues
              {repo._count.issues > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">{repo._count.issues}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="releases" className="gap-2">
              <Tag className="h-3.5 w-3.5" />Releases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {gitInfo ? (
                  <>
                    <FileTree repoPath={repo.gitPath} branch={repo.defaultBranch} owner={params.username} repoName={params.repo} />
                    <ReadmeViewer repoPath={repo.gitPath} branch={repo.defaultBranch} />
                  </>
                ) : (
                  <EmptyRepo owner={params.username} repoName={repo.name} />
                )}
              </div>
              <aside className="space-y-4">
                <CloneWidget owner={params.username} repoName={repo.name} />
                <div className="text-sm space-y-2">
                  {repo.language && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Langage</span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {repo.language}
                      </span>
                    </div>
                  )}
                  {repo.license && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Licence</span>
                      <span>{repo.license}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Branche par défaut</span>
                    <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{repo.defaultBranch}</span>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <IssuesList repoId={repo.id} owner={params.username} repoName={params.repo} canCreate={!!session} />
          </TabsContent>

          <TabsContent value="releases">
            <ReleasesList repoId={repo.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StarButton({ repoId, isStarred, count }: { repoId: string; isStarred: boolean; count: number }) {
  return (
    <form action={`/api/repos/${repoId}/star`} method="POST">
      <Button type="submit" variant="outline" size="sm" className="gap-2">
        <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
        {isStarred ? "Épinglé" : "Star"}
        <span className="text-muted-foreground text-xs">{count}</span>
      </Button>
    </form>
  );
}

function EmptyRepo({ owner, repoName }: { owner: string; repoName: string }) {
  const httpsUrl = `https://devhub.example.com/${owner}/${repoName}.git`;
  return (
    <div className="border border-dashed border-border rounded-xl p-8 space-y-4">
      <h3 className="font-semibold text-lg">Dépôt vide</h3>
      <p className="text-muted-foreground text-sm">Initialisez votre dépôt local et poussez votre code :</p>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-mono uppercase">Créer un nouveau dépôt</p>
        <pre className="code-block text-xs">
{`echo "# ${repoName}" >> README.md
git init
git add README.md
git commit -m "Initial commit"
git remote add origin ${httpsUrl}
git push -u origin main`}
        </pre>
      </div>
    </div>
  );
}

async function IssuesList({ repoId, owner, repoName, canCreate }: { repoId: string; owner: string; repoName: string; canCreate: boolean }) {
  const issues = await prisma.issue.findMany({
    where: { repoId, state: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: true },
  });
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{issues.length} issue(s) ouvertes</span>
        {canCreate && (
          <Link href={`/${owner}/${repoName}/issues/new`}>
            <Button size="sm">Nouvelle issue</Button>
          </Link>
        )}
      </div>
      {issues.map((issue) => (
        <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
          <AlertCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <Link href={`/${owner}/${repoName}/issues/${issue.number}`} className="font-medium hover:text-primary text-sm">
              {issue.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{issue.number} ouvert par {issue.author.username}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ReleasesList({ repoId }: { repoId: string }) {
  const releases = await prisma.release.findMany({
    where: { repoId, isDraft: false },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return (
    <div className="space-y-3">
      {releases.length === 0 && <p className="text-muted-foreground text-sm">Aucune release publiée.</p>}
      {releases.map((r) => (
        <div key={r.id} className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-semibold">{r.name || r.tagName}</span>
            <Badge variant="outline" className="text-xs">{r.tagName}</Badge>
            {r.isPrerelease && <Badge variant="secondary" className="text-xs">Pré-release</Badge>}
          </div>
          {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
        </div>
      ))}
    </div>
  );
}
