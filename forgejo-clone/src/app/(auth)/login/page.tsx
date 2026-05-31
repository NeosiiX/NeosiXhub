"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ login: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Nom d&apos;utilisateur ou email</Label>
            <Input
              id="login"
              placeholder="monpseudo ou email@exemple.fr"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Pas encore de compte ?{" "}
            <Link href="/(auth)/register" className="text-primary hover:underline font-medium">
              S&apos;inscrire
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
