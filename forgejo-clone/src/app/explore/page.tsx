import { prisma } from "@/lib/prisma";
import { RepoCard } from "@/components/repo/RepoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Explorer" };

export default async function ExplorePage({ searchParams }: { searchParams: { q?: string; sort?: string } }) {
  const q = searchParams.q || "";
  const sort = searchParams.sort || "updated";

  const repos = await prisma.repository.findMany({
    where: {
      isPrivate: false,
      ...(q ? { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { topics: { has: q } },
      ]} : {}),
    },
    orderBy: sort === "stars" ? { starsCount: "desc" } : sort === "forks" ? { forksCount: "desc" } : { updatedAt: "desc" },
    take: 30,
    include: { owner: { select: { username: true, avatarUrl: true } }, org: { select: { name: true, avatarUrl: true } } },
  });

  const trending = await prisma.repository.findMany({
    where: { isPrivate: false },
    orderBy: { starsCount: "desc" },
    take: 5,
    include: { owner: { select: { username: true } }, org: { select: { name: true } } },
  });

  return (
    <div className="container max-w-6xl py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explorer</h1>
        <p className="text-muted-foreground">Découvrez des projets open source hébergés sur DevHub.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="Rechercher des dépôts..." className="pl-9" />
            </div>
            <Button type="submit">Chercher</Button>
          </form>

          {/* Sort */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Trier par :</span>
            {[
              { value: "updated", label: "Récents" },
              { value: "stars", label: "Stars" },
              { value: "forks", label: "Forks" },
            ].map(({ value, label }) => (
              <Link key={value} href={`/explore?q=${q}&sort=${value}`}>
                <Button variant={sort === value ? "default" : "ghost"} size="sm" className="h-7">{label}</Button>
              </Link>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">{repos.length} dépôt(s) trouvé(s)</p>

          <div className="space-y-3">
            {repos.map((r) => <RepoCard key={r.id} repo={r} />)}
            {repos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Aucun résultat pour &quot;{q}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />Tendances
            </h3>
            <div className="space-y-2">
              {trending.map((r) => {
                const owner = r.owner?.username || r.org?.name || "unknown";
                return (
                  <Link key={r.id} href={`/${owner}/${r.name}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-sm group">
                    <span className="truncate group-hover:text-primary">{owner}/{r.name}</span>
                    <span className="flex items-center gap-1 text-muted-foreground text-xs shrink-0 ml-2">
                      <Star className="h-3 w-3" />{r.starsCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
