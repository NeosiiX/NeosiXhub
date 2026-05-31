import { Suspense } from "react";
import NewRepoForm from "./NewRepoForm";

export default function NewRepoPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-10 px-4 text-muted-foreground">Chargement...</div>}>
      <NewRepoForm />
    </Suspense>
  );
}
