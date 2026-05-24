#!/usr/bin/env node
/**
 * Generate index.json — a compact catalog summarising every template in
 * the repo. The bundled release tarball includes this file so the Rune seeder
 * can list available templates without parsing every JSON.
 *
 * Pass `--check` to fail (exit 1) if the on-disk index.json differs from the
 * generated one. Use this in CI to keep the index honest.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TEMPLATES_DIR = join(ROOT, "templates");
const INDEX_PATH = join(ROOT, "index.json");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith(".json")) yield full;
  }
}

async function main() {
  const check = process.argv.includes("--check");
  const entries = [];

  for await (const filePath of walk(TEMPLATES_DIR)) {
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    entries.push({
      external_id: parsed.external_id,
      name: parsed.name,
      description: parsed.description ?? "",
      category: parsed.category,
      icon: parsed.icon ?? null,
      tags: parsed.tags ?? [],
      author: parsed.author ?? null,
      path: relative(ROOT, filePath).replaceAll("\\", "/"),
    });
  }

  entries.sort((a, b) => a.external_id.localeCompare(b.external_id));

  const index = {
    generated_at: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    template_count: entries.length,
    templates: entries,
  };

  const serialised = JSON.stringify(index, null, 2) + "\n";

  if (check) {
    let onDisk = "";
    try {
      onDisk = await readFile(INDEX_PATH, "utf8");
    } catch {
      console.error("index.json is missing. Run: npm run build-index");
      process.exit(1);
    }
    const stripTimestamp = (s) =>
      s.replace(/"generated_at": "[^"]+",?\n?/, "");
    if (stripTimestamp(onDisk) !== stripTimestamp(serialised)) {
      console.error("index.json is out of date. Run: npm run build-index");
      process.exit(1);
    }
    console.log("✓ index.json is up to date.");
    return;
  }

  await writeFile(INDEX_PATH, serialised);
  console.log(`✓ Wrote index.json (${entries.length} templates).`);
}

await main();
