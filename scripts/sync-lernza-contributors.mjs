#!/usr/bin/env node
/**
 * Fetches https://api.github.com/repos/lernza/lernza/contributors
 * and writes src/data/lernza-contributors.json + CONTRIBUTORS.md
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url =
  "https://api.github.com/repos/lernza/lernza/contributors?per_page=100";

const res = await fetch(url, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "SmartDrop-sync-lernza-contributors",
  },
});

if (!res.ok) {
  console.error(`GitHub API ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const raw = await res.json();
if (!Array.isArray(raw)) {
  console.error("Unexpected API response");
  process.exit(1);
}

const contributors = raw.map((row) => ({
  login: row.login,
  html_url: row.html_url,
  contributions: row.contributions,
}));

const payload = {
  sourceRepo: "lernza/lernza",
  sourceUrl: url,
  fetchedAt: new Date().toISOString(),
  count: contributors.length,
  contributors,
};

const dataDir = join(root, "src", "data");
mkdirSync(dataDir, { recursive: true });
const jsonPath = join(dataDir, "lernza-contributors.json");
writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote", jsonPath, `(${contributors.length} rows)`);

const sorted = [...contributors].sort(
  (a, b) =>
    b.contributions - a.contributions || a.login.localeCompare(b.login)
);

const today = new Date().toISOString().slice(0, 10);
const md = [
  "# Contributors",
  "",
  "> **Where is this file?** In the GitHub / Git UI, open the repo root and click **`CONTRIBUTORS.md`** (next to `README.md` and `package.json`). Machine-readable data lives in **`src/data/lernza-contributors.json`**.",
  "",
  "People who have **authored commits** on this SmartDrop repository appear on GitHub under [**Insights → Contributors**](https://github.com/SmartDropLabs/SmartDrop/graphs/contributors) (or the same path on your fork, for example `prodbycorne/SmartDrop`). That graph is generated only from git history; it cannot list users who have never committed here.",
  "",
  "## Lernza (`lernza/lernza`) community",
  "",
  "SmartDrop sits in the same **Stellar / Soroban** builder community as [**lernza/lernza**](https://github.com/lernza/lernza) (learn-to-earn quests and milestones). We acknowledge **every GitHub-listed contributor** from that project so their work is visible from this repo as well.",
  "",
  `Data synced from the GitHub API on **${today}** ([contributors endpoint](${url})). **${contributors.length}** accounts are listed (including automation bots where GitHub counts them).`,
  "",
  "| GitHub login | Commits (on Lernza) |",
  "| --- | ---: |",
  ...sorted.map((row) => {
    const esc = row.login.replace("|", "\\|");
    return `| [@${esc}](${row.html_url}) | ${row.contributions} |`;
  }),
  "",
  "To refresh after Lernza gains new contributors:",
  "",
  "```bash",
  "npm run contributors:sync",
  "```",
  "",
].join("\n");

const mdPath = join(root, "CONTRIBUTORS.md");
writeFileSync(mdPath, md, "utf8");
console.log("Wrote", mdPath);
