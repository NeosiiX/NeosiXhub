import { getReadme } from "@/lib/git";
import { BookOpen } from "lucide-react";

interface ReadmeViewerProps {
  repoPath: string;
  branch: string;
}

export async function ReadmeViewer({ repoPath, branch }: ReadmeViewerProps) {
  const content = await getReadme(repoPath, branch).catch(() => null);
  if (!content) return null;

  // Very basic markdown-to-html (for production use a proper lib like remark)
  const html = content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, "<br />");

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 text-sm font-medium">
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
        README
      </div>
      <div
        className="p-6 prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
