"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: Date;
  _count: { repos: number };
}

export function UserAdminTable({
  users, total, page, pageSize, query,
}: {
  users: User[]; total: number; page: number; pageSize: number; query: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(query);

  async function patchUser(id: string, data: Partial<{ role: string; isActive: boolean }>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      toast({ title: "Erreur", description: d.error, variant: "destructive" });
    } else {
      toast({ title: "Mis à jour" });
      router.refresh();
    }
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`Supprimer l'utilisateur "${username}" ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast({ title: "Utilisateur supprimé" }); router.refresh(); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/users?q=${encodeURIComponent(search)}`);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="submit" size="sm">Filtrer</Button>
      </form>

      <div className="text-sm text-muted-foreground">{total} utilisateur(s)</div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Rôle</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Dépôts</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Inscrit</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/${u.username}`} className="font-medium hover:text-primary">{u.username}</Link>
                      {!u.isActive && <Badge variant="destructive" className="ml-2 text-xs">Suspendu</Badge>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {u.role === "ADMIN"
                    ? <Badge className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>
                    : <Badge variant="secondary">Utilisateur</Badge>}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{u._count.repos}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                  {formatDistanceToNow(new Date(u.createdAt), { locale: fr, addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                      title={u.isActive ? "Suspendre" : "Réactiver"}
                      onClick={() => patchUser(u.id, { isActive: !u.isActive })}>
                      {u.isActive
                        ? <ToggleRight className="h-4 w-4 text-green-500" />
                        : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                      title={u.role === "ADMIN" ? "Rétrograder" : "Promouvoir admin"}
                      onClick={() => patchUser(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })}>
                      <Shield className={`h-4 w-4 ${u.role === "ADMIN" ? "text-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteUser(u.id, u.username)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} sur {Math.ceil(total / pageSize)}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/users?q=${query}&page=${page - 1}`}>
                <Button variant="outline" size="sm">Précédent</Button>
              </Link>
            )}
            {page * pageSize < total && (
              <Link href={`/admin/users?q=${query}&page=${page + 1}`}>
                <Button variant="outline" size="sm">Suivant</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
