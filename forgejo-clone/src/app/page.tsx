import Link from "next/link";
import { GitBranch, Shield, Users, Zap, Star, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">DevHub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/explore" className="nav-link hidden sm:block">Explorer</Link>
            <Link href="/(auth)/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/(auth)/register">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
          <Zap className="h-3.5 w-3.5" />
          Plateforme Git auto-hébergée
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Votre forge Git,<br />vos règles.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Hébergez, collaborez et gérez vos dépôts Git avec une interface moderne.
          Organisations, équipes, issues, releases — tout ce dont vous avez besoin.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/(auth)/register">
            <Button size="lg" className="gap-2">
              Créer un compte gratuit
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline" className="gap-2">
              Explorer les projets
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto text-center">
          {[
            { icon: Users, label: "Utilisateurs", value: "∞" },
            { icon: GitFork, label: "Dépôts", value: "∞" },
            { icon: Star, label: "Open source", value: "100%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="container max-w-6xl py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Tout ce qu&apos;il vous faut</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span>DevHub</span>
          </div>
          <p>Fait avec ♥ — auto-hébergé, open source</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: GitBranch,
    title: "Dépôts Git réels",
    desc: "Push, pull, clone via SSH ou HTTPS. Support des branches, tags et releases.",
  },
  {
    icon: Users,
    title: "Organisations & équipes",
    desc: "Créez des organisations, invitez des membres, gérez les permissions par équipe.",
  },
  {
    icon: Shield,
    title: "Contrôle d'accès",
    desc: "Repos publics ou privés, collaborateurs, rôles admin/membre/propriétaire.",
  },
  {
    icon: Star,
    title: "Profils personnalisables",
    desc: "Bio, avatar, projets épinglés, favoris, statistiques de contribution.",
  },
  {
    icon: Zap,
    title: "Issues & commentaires",
    desc: "Suivi des bugs et des fonctionnalités avec labels, assignations et timeline.",
  },
  {
    icon: GitFork,
    title: "Forks & pull requests",
    desc: "Forkez n'importe quel dépôt public et proposez vos contributions.",
  },
];
