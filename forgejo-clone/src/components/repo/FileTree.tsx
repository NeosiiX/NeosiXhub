import { getTree } from "@/lib/git";
import Link from "next/link";
import { Folder, File, GitCommit } from "lucide-react";

interface FileTreeProps {
  repoPath: string;
  branch: string;
  owner: string;
  repoName: string;
  subPath?: string;
}

export async function FileTree({ repoPath, branch, owner, repoName, subPath = "." }: FileTreeProps) {
  const entries = await getTree(repoPath, branch, subPath).catch(() => []);

  if (entries.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
        Dossier vide ou non accessible.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 text-sm">
        <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Branche :</span>
        <span className="font-medium">{branch}</span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const isDir = entry.type === "tree";
          const href = `/${owner}/${repoName}/${isDir ? "tree" : "blob"}/${branch}/${entry.name}`;
          const Icon = isDir ? Folder : File;

          return (
            <div key={entry.name} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors text-sm group">
              <Icon className={`h-4 w-4 shrink-0 ${isDir ? "text-primary/70" : "text-muted-foreground"}`} />
              <Link href={href} className="hover:text-primary hover:underline flex-1 truncate">
                {entry.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
