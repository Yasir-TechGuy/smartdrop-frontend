#!/usr/bin/env node
/**
 * Creates empty commits on the current branch with Co-authored-by trailers so
 * GitHub Insights → Contributors lists upstream lernza/lernza contributors on
 * this repository (see https://github.blog/changelog/2019-02-14-commit-co-authors-now-show-in-github-contributors/).
 *
 * Run from repo root: node scripts/record-lernza-github-coauthors.mjs
 * Requires: git, network, clean working tree (or stash first).
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const url =
  "https://api.github.com/repos/lernza/lernza/contributors?per_page=100";

const res = await fetch(url, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "SmartDrop-record-lernza-coauthors",
  },
});

if (!res.ok) {
  console.error("GitHub API error", res.status, await res.text());
  process.exit(1);
}

const rows = await res.json();
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("No contributors returned");
  process.exit(1);
}

/** GitHub’s private noreply form so commits link to the correct account */
function noreplyEmail(login, id) {
  return `${id}+${login}@users.noreply.github.com`;
}

function assertCleanWorkingTree() {
  const out = execFileSync("git", ["status", "--porcelain", "-uno"], {
    encoding: "utf8",
  });
  if (out.trim()) {
    console.error(
      "Tracked files have uncommitted changes. Commit or stash before running."
    );
    process.exit(1);
  }
}

assertCleanWorkingTree();

const BATCH = 18;
const batches = [];
for (let i = 0; i < rows.length; i += BATCH) {
  batches.push(rows.slice(i, i + BATCH));
}

let b = 0;
for (const chunk of batches) {
  b += 1;
  const lines = [
    `chore: upstream lernza/lernza contributor attribution for GitHub Insights (part ${b}/${batches.length})`,
    "",
    "Transparent attribution only: these Co-authored-by trailers reference people who",
    "contributed to https://github.com/lernza/lernza (Stellar / Soroban learn-to-earn).",
    "SmartDrop does not claim they wrote SmartDrop code; this empty commit exists so GitHub",
    "can list their accounts under Insights → Contributors on this repo per GitHub’s rules.",
    "",
  ];
  for (const u of chunk) {
    const login = u.login;
    const id = u.id;
    const email = noreplyEmail(login, id);
    lines.push(`Co-authored-by: ${login} <${email}>`);
  }

  const file = join(tmpdir(), `smartdrop-coauthor-${b}.txt`);
  writeFileSync(file, lines.join("\n") + "\n", "utf8");
  try {
    execFileSync(
      "git",
      [
        "commit",
        "--allow-empty",
        "-F",
        file,
        "--author=prodbycorne <prodbycorne@users.noreply.github.com>",
      ],
      { stdio: "inherit", cwd: process.cwd() }
    );
  } finally {
    try {
      unlinkSync(file);
    } catch {
      /* ignore */
    }
  }
}

console.log(`Created ${batches.length} empty attribution commit(s) for ${rows.length} accounts.`);
