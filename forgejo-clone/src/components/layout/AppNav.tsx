"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitBranch, Bell, Plus, Search, ChevronDown, Settings, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionPayload } from "@/lib/session";

export function AppNav({ user }: { user: SessionPayload }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container max-w-7xl px-4 flex h-14 items-center gap-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <GitBranch className="h-5 w-5 text-primary" />
          <span className="font-bold hidden sm:block">DevHub</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-8 h-8 text-sm bg-muted/50" />
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <nav className="flex items-center gap-1">
          {/* New */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                <Plus className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href="/new-repo">Nouveau dépôt</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/new-org">Nouvelle organisation</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-muted-foreground font-normal">Connecté</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${user.username}`} className="gap-2">
                  <User className="h-4 w-4" />Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="gap-2">
                  <Settings className="h-4 w-4" />Paramètres
                </Link>
              </DropdownMenuItem>
              {user.role === "ADMIN" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="gap-2 text-primary">
                      <Shield className="h-4 w-4" />Administration
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
