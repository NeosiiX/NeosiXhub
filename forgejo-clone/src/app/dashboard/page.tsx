import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RepoCard } from "@/components/repo/RepoCard";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Star, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/(auth)/login");

  const [myRepos, starredRepos] = await Promise.all([
    prisma.repository.findMany({
      where: { ownerId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { owner: true },
    }),
    prisma.star.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { repo: { include: { owner: true, org: true } } },
    }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">Bienvenue, {session.username}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/new-repo">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau dépôt
            </Button>
          </Link>
          <Link href="/new-org">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Organisation
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="repos">
        <TabsList>
          <TabsTrigger value="repos" className="gap-2">
            <GitBranch className="h-3.5 w-3.5" />
            Mes dépôts ({myRepos.length})
          </TabsTrigger>
          <TabsTrigger value="starred" className="gap-2">
            <Star className="h-3.5 w-3.5" />
            Favoris ({starredRepos.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-3.5 w-3.5" />
            Récents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repos" className="mt-4 space-y-3">
          {myRepos.length === 0 ? (
            <EmptyState
              title="Aucun dépôt"
              desc="Créez votre premier dépôt pour commencer."
              action={{ label: "Nouveau dépôt", href: "/new-repo" }}
            />
          ) : (
            myRepos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
          )}
        </TabsContent>

        <TabsContent value="starred" className="mt-4 space-y-3">
          {starredRepos.length === 0 ? (
            <EmptyState
              title="Aucun favori"
              desc="Marquez des dépôts comme favoris pour les retrouver ici."
              action={{ label: "Explorer", href: "/explore" }}
            />
          ) : (
            starredRepos.map(({ repo }) => <RepoCard key={repo.id} repo={repo} />)
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4 space-y-3">
          {myRepos.slice(0, 5).map((repo) => <RepoCard key={repo.id} repo={repo} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, desc, action }: { title: string; desc: string; action: { label: string; href: string } }) {
  return (
    <div className="border border-dashed border-border rounded-xl p-12 text-center">
      <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      <Link href={action.href}>
        <Button size="sm">{action.label}</Button>
      </Link>
    </div>
  );
}
