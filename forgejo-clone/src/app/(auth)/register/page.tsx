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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription");
      toast({ title: "Compte créé !", description: "Bienvenue sur DevHub." });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>Rejoignez DevHub et hébergez vos projets</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d&apos;utilisateur</Label>
            <Input id="username" placeholder="monpseudo" value={form.username} onChange={update("username")}
              pattern="[a-zA-Z0-9_-]+" title="Lettres, chiffres, _ et - uniquement" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@exemple.fr" value={form.email} onChange={update("email")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={update("password")} minLength={8} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={update("confirm")} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Déjà un compte ?{" "}
            <Link href="/(auth)/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
