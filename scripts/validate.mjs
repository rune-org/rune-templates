#!/usr/bin/env node
/**
 * Validate every template JSON in `templates/**` against the bundle schema.
 *
 * Beyond schema-level checks we enforce a few repo conventions:
 *   1. File name (without extension) must equal the template's `external_id`.
 *   2. The parent directory must match the template's `category`
 *      (`social_media` lives under `social-media/` — the underscore form is the
 *      canonical enum value).
 *   3. `external_id` must be globally unique across the whole tree.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TEMPLATES_DIR = join(ROOT, "templates");
const SCHEMA_PATH = join(ROOT, "schema", "template.schema.json");

const CATEGORY_DIR_TO_ENUM = {
  general: "general",
  email: "email",
  analytics: "analytics",
  development: "development",
  cloud: "cloud",
  scheduling: "scheduling",
  "social-media": "social_media",
  productivity: "productivity",
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      yield fullPath;
    }
  }
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const errors = [];
  const seenIds = new Map();

  try {
    await stat(TEMPLATES_DIR);
  } catch {
    console.error(`templates/ directory missing at ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  let count = 0;
  for await (const filePath of walk(TEMPLATES_DIR)) {
    count++;
    const rel = relative(ROOT, filePath);
    let parsed;
    try {
      parsed = JSON.parse(await readFile(filePath, "utf8"));
    } catch (err) {
      errors.push(`${rel}: invalid JSON — ${err.message}`);
      continue;
    }

    if (!validate(parsed)) {
      for (const e of validate.errors ?? []) {
        errors.push(`${rel}: ${e.instancePath || "/"} ${e.message}`);
      }
      continue;
    }

    // file name == external_id
    const expectedFile = `${parsed.external_id}.json`;
    if (basename(filePath) !== expectedFile) {
      errors.push(
        `${rel}: filename must match external_id (${expectedFile})`,
      );
    }

    // directory matches category
    const categoryDir = basename(dirname(filePath));
    const expectedCategory = CATEGORY_DIR_TO_ENUM[categoryDir];
    if (!expectedCategory) {
      errors.push(
        `${rel}: category directory "${categoryDir}" is not a known category`,
      );
    } else if (expectedCategory !== parsed.category) {
      errors.push(
        `${rel}: category in JSON ("${parsed.category}") does not match directory ("${expectedCategory}")`,
      );
    }

    // unique external_id
    const previous = seenIds.get(parsed.external_id);
    if (previous) {
      errors.push(
        `${rel}: duplicate external_id "${parsed.external_id}" (also in ${previous})`,
      );
    } else {
      seenIds.set(parsed.external_id, rel);
    }
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} error(s) in ${count} template(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`✓ Validated ${count} template(s).`);
}

await main();
