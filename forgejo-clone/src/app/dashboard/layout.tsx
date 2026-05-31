import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppNav } from "@/components/layout/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/(auth)/login");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav user={session} />
      <main className="flex-1 container max-w-6xl py-6 px-4">
        {children}
      </main>
    </div>
  );
}
