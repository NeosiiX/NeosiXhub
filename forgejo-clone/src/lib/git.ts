import git from "isomorphic-git";
import fs from "fs";
import path from "path";

/** Initialize a bare git repository */
export async function initBareRepo(repoPath: string): Promise<void> {
  await fs.promises.mkdir(repoPath, { recursive: true });
  await git.init({ fs, dir: repoPath, bare: true });
}

/** Get basic repo info (last commit, branches) */
export async function getRepoInfo(repoPath: string) {
  if (!fs.existsSync(repoPath)) return null;

  const branches = await git.listBranches({ fs, dir: repoPath }).catch(() => []);
  if (branches.length === 0) return { branches: [], lastCommit: null, empty: true };

  const defaultBranch = branches.includes("main") ? "main" : branches[0];
  const [commitOid] = await git.log({ fs, dir: repoPath, ref: defaultBranch, depth: 1 }).catch(() => [null]);

  return {
    branches,
    defaultBranch,
    empty: false,
    lastCommit: commitOid
      ? {
          oid: commitOid.oid,
          message: commitOid.commit.message.split("\n")[0],
          author: commitOid.commit.author,
          timestamp: commitOid.commit.author.timestamp * 1000,
        }
      : null,
  };
}

export interface TreeEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
  mode: string;
}

/** List files at a given path in the repo */
export async function getTree(repoPath: string, ref: string, subPath = "."): Promise<TreeEntry[]> {
  if (!fs.existsSync(repoPath)) return [];
  try {
    const result = await git.readTree({
      fs,
      dir: repoPath,
      gitdir: repoPath,
      oid: await resolveRef(repoPath, ref),
    });

    // Navigate to subpath
    const entries: TreeEntry[] = result.tree.map((e) => ({
      name: e.path,
      type: e.type as "blob" | "tree",
      oid: e.oid,
      mode: e.mode,
    }));

    return entries.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "tree" ? -1 : 1;
    });
  } catch {
    return [];
  }
}

/** Read a blob (file content) */
export async function getBlob(repoPath: string, oid: string): Promise<string> {
  const { blob } = await git.readBlob({ fs, dir: repoPath, gitdir: repoPath, oid });
  return new TextDecoder().decode(blob);
}

/** Get README content */
export async function getReadme(repoPath: string, ref: string): Promise<string | null> {
  try {
    const tree = await getTree(repoPath, ref);
    const readme = tree.find((e) => e.type === "blob" && /^readme(\.(md|txt|rst))?$/i.test(e.name));
    if (!readme) return null;
    return getBlob(repoPath, readme.oid);
  } catch {
    return null;
  }
}

/** Get commit log */
export async function getCommits(repoPath: string, ref: string, depth = 20) {
  try {
    const commits = await git.log({ fs, dir: repoPath, ref, depth });
    return commits.map((c) => ({
      oid: c.oid,
      message: c.commit.message.split("\n")[0],
      author: c.commit.author.name,
      email: c.commit.author.email,
      timestamp: c.commit.author.timestamp * 1000,
    }));
  } catch {
    return [];
  }
}

async function resolveRef(repoPath: string, ref: string): Promise<string> {
  try {
    const commitOid = await git.resolveRef({ fs, dir: repoPath, gitdir: repoPath, ref });
    const { object } = await git.readObject({ fs, dir: repoPath, gitdir: repoPath, oid: commitOid });
    if (object.type === "commit") {
      // @ts-expect-error tree is on commit
      return object.object.tree;
    }
    return commitOid;
  } catch {
    return ref;
  }
}
