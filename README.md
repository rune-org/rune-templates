# rune-templates

The official template gallery for [Rune](https://github.com/rune-org/rune) — the
visual workflow automation platform. This repository is content-only: a curated
collection of starter workflows you can drop into your Rune instance with one
click.

## What lives here

```
templates/
├── general/
├── email/
├── analytics/
├── development/
├── cloud/
├── scheduling/
├── social-media/
└── productivity/
```

Each directory holds one `<external-id>.json` file per template. A template is a
JSON document validated against [`schema/template.schema.json`](./schema/template.schema.json),
which is generated from Rune's Pydantic models — so a template that lints here
will round-trip through the canvas, the workflow engine, and the renderer
without surprises.

## Using these templates

If you self-host Rune, all templates from this repo are pulled in at build
time and seeded into your database automatically. They appear in the
**Templates** page. You don't need to touch this repo at all, it's just the source of truth.

## Contributing a template

The intended flow is **one click in Rune, one PR here**:

1. Build your workflow in the Rune canvas.
2. Click **Export as community template** (canvas menu).
3. Fill in name, description, category, tags in the dialog. Download the JSON
   file.
4. Drop the file into the matching `templates/<category>/` directory.
5. Open a PR. CI will validate it against the schema; once green, a curator
   reviews it.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the long version, including how to
hand-author a template if you'd rather not use the export button.

## Schema sync

The schema in [`schema/template.schema.json`](./schema/template.schema.json) is
the contract. It is **generated** from [rune/services/api/src/templates/schemas.py](https://github.com/rune-org/rune/blob/main/services/api/src/templates/schemas.py)
via the `api-export-template-schema` Make target. Do not hand-edit it. When the
schema changes upstream, an automated PR opens here with the new version.

## License

[AGPL-3.0](./LICENSE), matching the main Rune project.
