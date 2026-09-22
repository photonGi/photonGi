import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const owner = "photonGi";

const repos = [
  {
    slug: "citeline",
    description:
      "Agentic RAG for documentation — crawl a docs site, answer with heading-level citations, or refuse when the source does not cover the question.",
  },
  {
    slug: "EarthDiff",
    description:
      "Satellite change detection on Sentinel-2 — before/after imagery, hectares by change type, and Gemini summaries checked against pixel-derived stats.",
  },
  {
    slug: "multi-tenant-rag-chatbot",
    description:
      "Multi-tenant RAG chatbot — Next.js admin and chat UI, Supabase auth with RLS, pgvector storage, and n8n webhooks for ingest and answers.",
  },
  {
    slug: "Hire_Local",
    description:
      "ServiceGPT backend — find local service providers from structured fields or natural-language queries using AI-powered web search.",
  },
  {
    slug: "designer-portfolio",
    description:
      "Designer portfolio built with Next.js — case studies, responsive layout, and polished presentation for creative work.",
  },
];

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapDescription(text, maxCharsPerLine = 52) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function buildSvg(repo, meta) {
  const title = escapeXml(repo.name);
  const descLines = wrapDescription(meta.description).map(escapeXml);
  const stars = repo.stargazers_count ?? 0;
  const lang = escapeXml(repo.language ?? "Code");
  const height = descLines.length > 1 ? 132 : 118;

  const descY = descLines.length > 1 ? [48, 64] : [48];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="415" height="${height}" viewBox="0 0 415 ${height}" role="img" aria-label="${title}">
  <rect width="415" height="${height}" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <rect width="415" height="3" rx="6" fill="#38bdf8" opacity="0.85"/>
  <text x="16" y="28" fill="#0284c7" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600">${title}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${descY[i] + 2}" fill="#64748b" font-family="Segoe UI, system-ui, sans-serif" font-size="12">${line}</text>`,
    )
    .join("\n  ")}
  <text x="16" y="${height - 16}" fill="#94a3b8" font-family="Segoe UI, system-ui, sans-serif" font-size="11">★ ${stars}</text>
  <circle cx="72" cy="${height - 20}" r="4" fill="#3178c6"/>
  <text x="82" y="${height - 16}" fill="#94a3b8" font-family="Segoe UI, system-ui, sans-serif" font-size="11">${lang}</text>
</svg>`;
}

async function fetchRepo(slug) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${slug}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "photonGi-profile-readme" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${slug}: ${res.status}`);
  return res.json();
}

const outDir = resolve(process.cwd(), "assets/pins");
await mkdir(outDir, { recursive: true });

for (const meta of repos) {
  const repo = await fetchRepo(meta.slug);
  const svg = buildSvg(repo, meta);
  const file = resolve(outDir, `${meta.slug}.svg`);
  await writeFile(file, svg, "utf8");
  console.log("Wrote", file);
}

console.log("Run: node scripts/render-profile-images.mjs  (PNG for GitHub README)");
