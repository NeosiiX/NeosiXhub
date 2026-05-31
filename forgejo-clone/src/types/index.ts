// Re-export Prisma types for convenience
export type { User, Repository, Organization, Issue, Star, Follow } from "@prisma/client";

export interface SessionUser {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
}

export interface ApiError {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type RepoVisibility = "public" | "private";

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

export interface GitCommit {
  oid: string;
  message: string;
  author: string;
  email: string;
  timestamp: number;
}

export interface GitTreeEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
  mode: string;
}
