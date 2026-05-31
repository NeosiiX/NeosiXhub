import { GitBranch } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <GitBranch className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold tracking-tight">DevHub</span>
      </Link>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
