import { prisma } from "@/lib/prisma";
import { Users, GitBranch, Building2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  const [usersCount, reposCount, orgsCount, starsCount] = await Promise.all([
    prisma.user.count(),
    prisma.repository.count(),
    prisma.organization.count(),
    prisma.star.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, username: true, email: true, role: true, createdAt: true, isActive: true },
  });

  const stats = [
    { label: "Utilisateurs", value: usersCount, icon: Users, color: "text-blue-500" },
    { label: "Dépôts", value: reposCount, icon: GitBranch, color: "text-green-500" },
    { label: "Organisations", value: orgsCount, icon: Building2, color: "text-purple-500" },
    { label: "Stars totales", value: starsCount, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Derniers inscrits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.role === "ADMIN" && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
                  )}
                  {!u.isActive && (
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Suspendu</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
