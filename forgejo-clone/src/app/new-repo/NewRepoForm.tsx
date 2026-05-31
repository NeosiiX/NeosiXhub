"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Globe, Loader2 } from "lucide-react";

export default function NewRepoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orgId = searchParams.get("org") || "";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", isPrivate: false,
    defaultBranch: "main", license: "", orgId, initReadme: true,
  });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Dépôt créé !" });
      router.push(`/${data.owner?.username || data.org?.name}/${data.name}`);
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Créer un nouveau dépôt</h1>
        <p className="text-muted-foreground text-sm mt-1">Un dépôt contient tous les fichiers de votre projet, ainsi que l&apos;historique des révisions.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Informations du dépôt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du dépôt *</Label>
              <Input id="name" placeholder="mon-projet" value={form.name} onChange={update("name")}
                pattern="[a-zA-Z0-9._-]+" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(optionnel)</span></Label>
              <textarea id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Décrivez votre projet..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branche par défaut</Label>
              <Input id="branch" value={form.defaultBranch} onChange={update("defaultBranch")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Licence</Label>
              <select id="license" value={form.license} onChange={update("license")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Aucune licence</option>
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL v3</option>
                <option value="BSD-3-Clause">BSD 3-Clause</option>
                <option value="AGPL-3.0">AGPL v3</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Visibilité</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { value: false, icon: Globe, label: "Public", desc: "Tout le monde peut voir ce dépôt." },
              { value: true, icon: Lock, label: "Privé", desc: "Seul vous et les collaborateurs invités pouvez voir ce dépôt." },
            ].map(({ value, icon: Icon, label, desc }) => (
              <label key={label} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.isPrivate === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <input type="radio" name="visibility" className="mt-0.5" checked={form.isPrivate === value}
                  onChange={() => setForm({ ...form, isPrivate: value })} />
                <div>
                  <div className="flex items-center gap-2 font-medium text-sm"><Icon className="h-4 w-4" />{label}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading || !form.name}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer le dépôt
        </Button>
      </form>
    </div>
  );
}
