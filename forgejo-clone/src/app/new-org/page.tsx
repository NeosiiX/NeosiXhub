"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";

export default function NewOrgPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", displayName: "", description: "", websiteUrl: "", location: "", isPublic: true });
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Organisation créée !" });
      router.push(`/orgs/${data.name}`);
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur inconnue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Créer une organisation</h1>
          <p className="text-muted-foreground text-sm">Collaborez sur des projets avec d&apos;autres personnes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Identité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;organisation *</Label>
              <Input id="name" placeholder="mon-org" value={form.name} onChange={update("name")}
                pattern="[a-zA-Z0-9_-]+" title="Lettres, chiffres, _ et - uniquement" required />
              <p className="text-xs text-muted-foreground">Utilisé dans les URLs : devhub.example.com/orgs/<strong>{form.name || "mon-org"}</strong></p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom affiché <span className="text-muted-foreground">(optionnel)</span></Label>
              <Input id="displayName" placeholder="Mon Organisation" value={form.displayName} onChange={update("displayName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Décrivez votre organisation..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Informations supplémentaires</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input id="location" placeholder="Paris, France" value={form.location} onChange={update("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Site web</Label>
              <Input id="websiteUrl" type="url" placeholder="https://monsite.fr" value={form.websiteUrl} onChange={update("websiteUrl")} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
              <div>
                <p className="text-sm font-medium">Organisation publique</p>
                <p className="text-xs text-muted-foreground">Les membres et dépôts publics seront visibles par tous.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading || !form.name}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer l&apos;organisation
        </Button>
      </form>
    </div>
  );
}
