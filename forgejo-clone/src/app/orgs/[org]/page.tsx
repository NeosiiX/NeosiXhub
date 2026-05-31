import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Link2, Users, GitBranch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepoCard } from "@/components/repo/RepoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export async function generateMetadata({ params }: { params: { org: string } }) {
  return { title: params.org };
}

export default async function OrgPage({ params }: { params: { org: string } }) {
  const session = await getSession();
  const org = await prisma.organization.findUnique({
    where: { name: params.org },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      repos: {
        where: session
          ? { OR: [{ isPrivate: false }, { collaborators: { some: { userId: session.id } } }] }
          : { isPrivate: false },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { owner: true, org: true },
      },
      _count: { select: { members: true, repos: true } },
    },
  });

  if (!org) notFound();

  const membershipRole = session
    ? org.members.find((m) => m.userId === session.id)?.role
    : null;
  const canManage = membershipRole === "OWNER" || membershipRole === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="space-y-4">
              {org.avatarUrl ? (
                <Image src={org.avatarUrl} alt={org.name} width={200} height={200} className="rounded-xl w-full aspect-square object-cover border border-border" />
              ) : (
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-5xl font-bold text-primary border border-border">
                  {org.name[0].toUpperCase()}
                </div>
              )}

              <div>
                {org.displayName && <h1 className="text-xl font-bold">{org.displayName}</h1>}
                <p className="text-muted-foreground">@{org.name}</p>
              </div>

              {org.description && <p className="text-sm text-muted-foreground">{org.description}</p>}

              {canManage && (
                <Link href={`/orgs/${org.name}/settings`}>
                  <Button variant="outline" className="w-full">Gérer l&apos;organisation</Button>
                </Link>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                {org.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{org.location}</div>}
                {org.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    <a href={org.websiteUrl} className="text-primary hover:underline truncate">{org.websiteUrl}</a>
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <span><span className="font-semibold">{org._count.members}</span> <span className="text-muted-foreground">membres</span></span>
                <span><span className="font-semibold">{org._count.repos}</span> <span className="text-muted-foreground">dépôts</span></span>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="repos">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="repos" className="gap-2">
                    <GitBranch className="h-3.5 w-3.5" />Dépôts ({org._count.repos})
                  </TabsTrigger>
                  <TabsTrigger value="members" className="gap-2">
                    <Users className="h-3.5 w-3.5" />Membres ({org._count.members})
                  </TabsTrigger>
                </TabsList>
                {canManage && (
                  <Link href={`/new-repo?org=${org.id}`}>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nouveau dépôt</Button>
                  </Link>
                )}
              </div>

              <TabsContent value="repos" className="space-y-3">
                {org.repos.map((r) => <RepoCard key={r.id} repo={r} />)}
                {org.repos.length === 0 && <p className="text-muted-foreground text-sm">Aucun dépôt.</p>}
              </TabsContent>

              <TabsContent value="members">
                <div className="grid sm:grid-cols-2 gap-3">
                  {org.members.map(({ user, role }) => (
                    <Link key={user.id} href={`/${user.username}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/40 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{user.displayName || user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username} · {role.toLowerCase()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
