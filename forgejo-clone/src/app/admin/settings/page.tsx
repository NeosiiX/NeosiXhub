"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "DevHub",
    siteDescription: "Plateforme Git auto-hébergée",
    allowRegistration: true,
    requireEmailVerification: false,
    maxReposPerUser: "100",
    gitRoot: "/git-repos",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // TODO: POST /api/admin/settings
    toast({ title: "Paramètres sauvegardés" });
    setLoading(false);
  }

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings({ ...settings, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Paramètres du site</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Général</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du site</Label>
              <Input value={settings.siteName} onChange={update("siteName")} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={settings.siteDescription} onChange={update("siteDescription")} />
            </div>
            <div className="space-y-2">
              <Label>Répertoire Git (GIT_ROOT)</Label>
              <Input value={settings.gitRoot} onChange={update("gitRoot")} className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Inscription & accès</CardTitle>
            <CardDescription>Contrôlez qui peut s&apos;inscrire sur la plateforme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.allowRegistration} onChange={update("allowRegistration")} />
              <div>
                <p className="text-sm font-medium">Autoriser les inscriptions</p>
                <p className="text-xs text-muted-foreground">Si désactivé, seul un admin peut créer des comptes.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.requireEmailVerification} onChange={update("requireEmailVerification")} />
              <div>
                <p className="text-sm font-medium">Vérification email obligatoire</p>
                <p className="text-xs text-muted-foreground">Nécessite un serveur SMTP configuré.</p>
              </div>
            </label>
            <div className="space-y-2">
              <Label>Dépôts max par utilisateur</Label>
              <Input type="number" value={settings.maxReposPerUser} onChange={update("maxReposPerUser")} className="w-32" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sauvegarder
        </Button>
      </form>
    </div>
  );
}
