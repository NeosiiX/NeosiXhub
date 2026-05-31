"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProfileForm {
  displayName: string;
  bio: string;
  location: string;
  websiteUrl: string;
  twitterHandle: string;
}

export default function SettingsProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({ displayName: "", bio: "", location: "", websiteUrl: "", twitterHandle: "" });

  useEffect(() => {
    fetch("/api/users/me").then((r) => r.json()).then((d) => {
      if (d.displayName !== undefined) setForm({
        displayName: d.displayName || "",
        bio: d.bio || "",
        location: d.location || "",
        websiteUrl: d.websiteUrl || "",
        twitterHandle: d.twitterHandle || "",
      });
    });
  }, []);

  const update = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Profil mis à jour !" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Profil public</h2>
        <p className="text-sm text-muted-foreground">Ces informations seront visibles sur votre page de profil.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom affiché</Label>
              <Input id="displayName" placeholder="Jean Dupont" value={form.displayName} onChange={update("displayName")} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Développeur passionné, amateur de café..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{form.bio.length}/300 caractères</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Liens & localisation</CardTitle>
            <CardDescription>Ajoutez des liens pour que les gens puissent en savoir plus sur vous.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input id="location" placeholder="Paris, France" value={form.location} onChange={update("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Site web</Label>
              <Input id="websiteUrl" type="url" placeholder="https://monsite.fr" value={form.websiteUrl} onChange={update("websiteUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter / X</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">@</span>
                <Input id="twitterHandle" placeholder="monpseudo" value={form.twitterHandle} onChange={update("twitterHandle")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sauvegarder les modifications
        </Button>
      </form>
    </div>
  );
}
