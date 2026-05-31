import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { Shield, Users, Building2, Settings, Activity, GitBranch } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Vue d'ensemble", icon: Activity },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/orgs", label: "Organisations", icon: Building2 },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30">
        <div className="container max-w-7xl px-4">
          <div className="flex items-center gap-3 py-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Administration</span>
            <span className="text-muted-foreground text-sm">DevHub</span>
          </div>
        </div>
      </div>
      <div className="container max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <nav className="lg:w-56 shrink-0">
            <div className="space-y-1">
              {adminNav.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
