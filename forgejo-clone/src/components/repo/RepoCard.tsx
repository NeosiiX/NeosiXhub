import Link from "next/link";
import { GitBranch, Lock, Star, GitFork, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RepoCardProps {
  repo: {
    id: string;
    name: string;
    description?: string | null;
    isPrivate: boolean;
    isArchived?: boolean;
    language?: string | null;
    topics?: string[];
    starsCount: number;
    forksCount: number;
    updatedAt: Date;
    owner?: { username: string; avatarUrl?: string | null } | null;
    org?: { name: string; avatarUrl?: string | null } | null;
  };
  compact?: boolean;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Vue: "#41b883",
};

export function RepoCard({ repo, compact = false }: RepoCardProps) {
  const owner = repo.owner?.username || repo.org?.name || "unknown";
  const href = `/${owner}/${repo.name}`;

  return (
    <div className={cn(
      "repo-card group",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Name */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={href} className="font-semibold text-primary hover:underline truncate text-sm">
              {owner}/{repo.name}
            </Link>
            {repo.isPrivate ? (
              <Badge variant="outline" className="gap-1 text-xs py-0 h-5">
                <Lock className="h-2.5 w-2.5" />Privé
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs py-0 h-5">
                <Globe className="h-2.5 w-2.5" />Public
              </Badge>
            )}
            {repo.isArchived && (
              <Badge variant="secondary" className="text-xs py-0 h-5">Archivé</Badge>
            )}
          </div>

          {/* Description */}
          {!compact && repo.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
          )}

          {/* Topics */}
          {!compact && repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {repo.topics.slice(0, 5).map((t) => (
                <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="badge-lang">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: LANG_COLORS[repo.language] || "#888" }}
            />
            {repo.language}
          </span>
        )}
        {repo.starsCount > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.starsCount.toLocaleString()}
          </span>
        )}
        {repo.forksCount > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {repo.forksCount.toLocaleString()}
          </span>
        )}
        <span className="ml-auto">
          Mis à jour {formatDistanceToNow(new Date(repo.updatedAt), { locale: fr, addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
