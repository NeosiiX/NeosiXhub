import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { User, KeyRound, Bell, Shield } from "lucide-react";

const settingsNav = [
  { href: "/settings/profile", label: "Profil", icon: User },
  { href: "/settings/security", label: "Sécurité", icon: Shield },
  { href: "/settings/ssh-keys", label: "Clés SSH", icon: KeyRound },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/(auth)/login");

  return (
    <div className="container max-w-5xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-52 shrink-0">
          <div className="space-y-1">
            {settingsNav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
