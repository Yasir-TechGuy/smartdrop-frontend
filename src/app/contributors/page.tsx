import type { Metadata } from "next";
import type { CSSProperties } from "react";

import lernzaContributorData from "@/data/lernza-contributors.json";

export const metadata: Metadata = {
  title: "Contributors | SmartDrop",
  description:
    "Community contributors acknowledged from the Lernza Stellar / Soroban project",
};

const shell: CSSProperties = {
  minHeight: "60vh",
  padding: "2rem 1.5rem 4rem",
  maxWidth: "56rem",
  margin: "0 auto",
  color: "#fff",
};

const linkStyle: CSSProperties = {
  color: "#7dd3fc",
  textDecoration: "underline",
};

export default function ContributorsPage() {
  const rows = lernzaContributorData.contributors;
  const sorted = [...rows].sort(
    (a, b) =>
      b.contributions - a.contributions || a.login.localeCompare(b.login)
  );

  return (
    <div style={shell}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Contributors
      </h1>
      <p style={{ opacity: 0.9, marginBottom: "1.25rem", lineHeight: 1.6 }}>
        SmartDrop thanks everyone who has contributed to{" "}
        <a
          href="https://github.com/lernza/lernza"
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          lernza/lernza
        </a>{" "}
        (learn-to-earn on Stellar). The list is{" "}
        <strong>checked into this repository</strong> as{" "}
        <a
          href="https://github.com/SmartDropLabs/SmartDrop/blob/main/src/data/lernza-contributors.json"
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          src/data/lernza-contributors.json
        </a>{" "}
        and mirrored in{" "}
        <a
          href="https://github.com/SmartDropLabs/SmartDrop/blob/main/CONTRIBUTORS.md"
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          CONTRIBUTORS.md
        </a>
        . Last synced: {lernzaContributorData.fetchedAt.slice(0, 10)}.
      </p>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.85 }}>
        {sorted.length} accounts (including bots GitHub counts).
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "0.35rem 1.5rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
        }}
      >
        {sorted.map((c) => (
          <li key={c.login}>
            <a href={c.html_url} target="_blank" rel="noreferrer" style={linkStyle}>
              @{c.login}
            </a>
            <span style={{ opacity: 0.65, marginLeft: "0.35rem" }}>
              ({c.contributions})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
