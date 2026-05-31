import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Link2, Twitter, Calendar, Users, GitBranch, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepoCard } from "@/components/repo/RepoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export async function generateMetadata({ params }: { params: { username: string } }) {
  return { title: params.username };
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      repos: {
        where: { OR: [{ isPrivate: false }, ...(session ? [{ ownerId: session.id }] : [])] },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { owner: true },
      },
      pinnedRepos: {
        orderBy: { position: "asc" },
        include: { repo: { include: { owner: true } } },
      },
      _count: { select: { followers: true, following: true, repos: true } },
    },
  });

  if (!user || !user.isActive) notFound();

  const isOwnProfile = session?.id === user.id;
  const isFollowing = session
    ? await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.id, followingId: user.id } } })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Avatar */}
              <div className="relative">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.username} width={260} height={260}
                    className="rounded-full w-full aspect-square object-cover border-4 border-border" />
                ) : (
                  <div className="w-full aspect-square rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-6xl font-bold text-primary border-4 border-border">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                {user.displayName && <h1 className="text-xl font-bold">{user.displayName}</h1>}
                <p className="text-lg text-muted-foreground">@{user.username}</p>
              </div>

              {/* Actions */}
              {isOwnProfile ? (
                <Link href="/settings/profile">
                  <Button variant="outline" className="w-full">Modifier le profil</Button>
                </Link>
              ) : (
                <form action={`/api/users/${user.id}/follow`} method="POST">
                  <Button variant={isFollowing ? "outline" : "default"} className="w-full">
                    {isFollowing ? "Ne plus suivre" : "Suivre"}
                  </Button>
                </form>
              )}

              {/* Bio */}
              {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}

              {/* Meta */}
              <div className="space-y-2 text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{user.location}</div>
                )}
                {user.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    <a href={user.websiteUrl} className="text-primary hover:underline truncate">{user.websiteUrl}</a>
                  </div>
                )}
                {user.twitterHandle && (
                  <div className="flex items-center gap-2"><Twitter className="h-4 w-4" />@{user.twitterHandle}</div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {formatDistanceToNow(user.createdAt, { locale: fr, addSuffix: true })}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <Link href={`/${user.username}?tab=followers`} className="hover:text-primary">
                  <span className="font-semibold">{user._count.followers}</span>
                  <span className="text-muted-foreground ml-1">abonnés</span>
                </Link>
                <Link href={`/${user.username}?tab=following`} className="hover:text-primary">
                  <span className="font-semibold">{user._count.following}</span>
                  <span className="text-muted-foreground ml-1">abonnements</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Pinned repos */}
            {user.pinnedRepos.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Dépôts épinglés
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {user.pinnedRepos.map(({ repo }) => (
                    <RepoCard key={repo.id} repo={repo} compact />
                  ))}
                </div>
              </section>
            )}

            <Tabs defaultValue="repos">
              <TabsList>
                <TabsTrigger value="repos" className="gap-2">
                  <GitBranch className="h-3.5 w-3.5" />
                  Dépôts ({user._count.repos})
                </TabsTrigger>
                <TabsTrigger value="stars" className="gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Favoris
                </TabsTrigger>
                <TabsTrigger value="orgs" className="gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Organisations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="repos" className="mt-4 space-y-3">
                {user.repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
              </TabsContent>

              <TabsContent value="stars" className="mt-4">
                <StarredRepos userId={user.id} />
              </TabsContent>

              <TabsContent value="orgs" className="mt-4">
                <UserOrgs userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

async function StarredRepos({ userId }: { userId: string }) {
  const stars = await prisma.star.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { repo: { include: { owner: true, org: true } } },
  });
  return (
    <div className="space-y-3">
      {stars.map(({ repo }) => <RepoCard key={repo.id} repo={repo} />)}
      {stars.length === 0 && <p className="text-muted-foreground text-sm">Aucun favori.</p>}
    </div>
  );
}

async function UserOrgs({ userId }: { userId: string }) {
  const memberships = await prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
  });
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {memberships.map(({ org }) => (
        <Link key={org.id} href={`/orgs/${org.name}`}
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
          {org.avatarUrl ? (
            <Image src={org.avatarUrl} alt={org.name} width={36} height={36} className="rounded-md" />
          ) : (
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {org.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{org.displayName || org.name}</p>
            <p className="text-xs text-muted-foreground">@{org.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
