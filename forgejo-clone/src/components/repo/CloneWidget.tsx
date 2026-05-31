"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CloneWidget({ owner, repoName }: { owner: string; repoName: string }) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://devhub.example.com";
  const httpsUrl = `${base}/${owner}/${repoName}.git`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden text-sm">
      <div className="px-3 py-2 border-b border-border bg-muted/30 font-medium">Cloner</div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <input
            readOnly
            value={httpsUrl}
            className="flex-1 min-w-0 text-xs bg-muted rounded px-2 py-1.5 font-mono truncate"
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          git clone {httpsUrl}
        </p>
      </div>
    </div>
  );
}
