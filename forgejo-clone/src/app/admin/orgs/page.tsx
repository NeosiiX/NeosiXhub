import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Users, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = { title: "Gérer les organisations" };

export default async function AdminOrgsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  const orgs = await prisma.organization.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { members: true, repos: true } } },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Organisations ({orgs.length})</h1>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Organisation</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Membres</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Dépôts</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Créée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/orgs/${org.name}`} className="flex items-center gap-3 hover:text-primary">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {org.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{org.displayName || org.name}</p>
                      <p className="text-xs text-muted-foreground">@{org.name}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" />{org._count.members}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><GitBranch className="h-3.5 w-3.5" />{org._count.repos}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                  {formatDistanceToNow(org.createdAt, { locale: fr, addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
