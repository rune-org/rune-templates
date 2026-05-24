# Contributing a template

There are two ways to contribute.

## The easy way: export from Rune

1. Build the workflow you want to share in the Rune canvas.
2. Open the canvas menu and click **Export as community template**.
3. Fill in the dialog:
   - **Name** — short, human title (e.g. *"Gmail → Slack daily digest"*).
   - **Description** — one or two sentences on what the workflow does.
   - **Category** — pick from the list (it matches our directory layout).
   - **Tags** — free-form. Use what feels right; the gallery will surface
     popular tags as filter chips and a curator may promote a few to *official*.
     See the existing catalogue at [rune.dev/tags](https://rune.dev/tags).
   - **Author** (optional) — display name and a link if you'd like attribution.
4. Click **Download `<slug>.json`**.
5. Put the file under `templates/<category>/`. The file name **must** match the
   `external_id` inside it (the export button does this for you).
6. Open a pull request.

CI runs validation checks on every PR. If anything is off, you'll see exactly
which field failed.

## The manual way

If you'd rather hand-author, here's the minimum shape — refer to
[`schema/template.schema.json`](./schema/template.schema.json) for the full
contract:

```json
{
  "external_id": "gmail-to-slack-digest",
  "name": "Gmail -> Slack daily digest",
  "description": "Summarise unread Gmail and post a digest to Slack each morning.",
  "category": "email",
  "icon": "Mail",
  "tags": ["gmail", "slack", "digest"],
  "author": { "name": "Your Name", "url": "https://github.com/you" },
  "workflow_data": {
    "nodes": [
      { "id": "n1", "type": "scheduledTrigger", "trigger": true, "data": {...}, "position": {"x": 0, "y": 0} }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2" }
    ]
  }
}
```

Rules:

- `external_id` must be `lower-kebab-case`, unique across the whole repo, and
  match the file name (`<external_id>.json`).
- `category` must be one of the supported values — see the enum in the schema.
- `workflow_data.nodes[].data` is intentionally loose: different node types take
  different config. The shape on the canvas is the shape the schema expects.
- **Never** include credentials, OAuth tokens, webhook GUIDs, or anything else
  sensitive. The export button strips these for you.

## Official vs community

Every bundled template surfaces in the Rune gallery in one of two buckets:

- **Official** - curated by the Rune team. Sets `"official": true`.
- **Community** - everything else (the default). Omit the field or set it to
  `false`.

Contributor PRs should never set `"official": true`. Reviewers will reject any
PR from outside the Rune team that flips this flag.

## Running validation locally

```bash
pnpm install
pnpm run validate             # validate every template against the schema
pnpm run build-index          # rebuild index.json
```

## Tag suggestions

Tags are free-form here, but the Rune app keeps a live catalog. To get a tag
promoted to *official*, open an issue describing the use case. 
Don't worry about that for your first contribution, just use whatever tag feels natural.

## License

By contributing, you agree your template is licensed under
[AGPL-3.0](./LICENSE), matching the main Rune project.
