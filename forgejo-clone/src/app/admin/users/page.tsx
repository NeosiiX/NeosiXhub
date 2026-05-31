import { prisma } from "@/lib/prisma";
import { UserAdminTable } from "@/components/admin/UserAdminTable";

export const metadata = { title: "Gérer les utilisateurs" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const page = Number(searchParams.page || 1);
  const pageSize = 20;
  const q = searchParams.q || "";

  const where = q
    ? { OR: [{ username: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { repos: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <UserAdminTable users={users} total={total} page={page} pageSize={pageSize} query={q} />
    </div>
  );
}
