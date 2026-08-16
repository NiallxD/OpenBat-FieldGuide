# OpenBat — Field Guide

The **species field guide data** for the OpenBat iOS app: a single
community-editable JSON file the app downloads and shows in its Species
section, plus the range-map coordinates behind it. **This is the canonical
home for both files and for the schema below.**

| Repo | What's in it |
|---|---|
| [OpenBat-App](https://github.com/NiallxD/OpenBat-App) | The iOS app itself — what it is, features, how to build it. |
| [OpenBat-FieldGuide](https://github.com/NiallxD/OpenBat-FieldGuide) | This one — guide data, range data, and how to contribute. |
| [OpenBat-Website](https://github.com/NiallxD/OpenBat-website) | The website, openbat.app. |

For what the app is and does, see the
[app repo](https://github.com/NiallxD/OpenBat-App) — it isn't restated here, so
there's only one description to keep true.

**Help and privacy live on the website, not in this repo:**
[help](https://openbat.app/help/) and
[privacy policy](https://openbat.app/privacy-policy/). This repo used to serve
its own stub copies of both as a GitHub Pages site; they were placeholders that
contradicted the real ones, and have been removed.

You don't need to touch app code to add a species, edit an entry, or add a
region: edit the JSON here and open a PR. Merged changes reach every install on
next launch, with no app update.

## Contributing a species or region

The field guide lives entirely in one file: [`SpeciesGuideData.json`](./SpeciesGuideData.json).
No app code changes are needed to add a species, edit an existing entry, or
add a new region, just edit the JSON and open a PR.

1. Fork the repo and edit `SpeciesGuideData.json`.
2. Add your species (or region) following the schema below.
3. **Bump `dataVersion` by 1** and set `updatedAt` to today's date, see
   [Versioning](#versioning). This is required for every content change,
   however small, or the app won't pick it up.
4. Open a PR. Once merged to `main`, every app install picks up the change
   automatically the next time it launches (no app update needed).

### Schema

Top level:

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | Int | **Don't change this.** See [Versioning](#versioning). |
| `dataVersion` | Int | Bump by 1 on every content edit. |
| `updatedAt` | String (ISO 8601) | e.g. `"2026-07-06T00:00:00Z"`. Set alongside every `dataVersion` bump. |
| `regions` | [Region] | Pins shown on the explorer globe. |
| `species` | [Species] | The field guide entries. |

**Region:**

| Field | Type | Notes |
|---|---|---|
| `id` | String | Stable slug, e.g. `"uk-ireland"`. Referenced by species' `regions` list, don't rename an existing one without updating every species that references it. |
| `name` | String | Display name, e.g. `"UK & Ireland"`. |
| `latitude` / `longitude` | Double | Where the pin sits on the globe. |

**Species:** only `id`, `commonName`, `scientificName`, and `regions` are
required, everything else is optional. Add what you know; leave the rest
out. The app only shows a section if its fields are present, so a sparse
entry just renders a shorter page rather than empty boxes.

| Field | Type | Notes |
|---|---|---|
| `id` | String | Stable slug, e.g. `"pipistrellus-pipistrellus"` (genus-species, lowercase, hyphenated). |
| `commonName` | String | e.g. `"Common Pipistrelle"`. |
| `scientificName` | String | e.g. `"Pipistrellus pipistrellus"`. Genus (for the taxonomy breadcrumb) is parsed from this automatically, don't add a separate genus field. |
| `order` | String? | Taxonomic order, e.g. `"Chiroptera"`. |
| `family` | String? | e.g. `"Vespertilionidae"`. |
| `regions` | [String] | List of region `id`s where this species occurs. |
| `summary` | String? | Short intro paragraph. |
| `measurements` | Object? | `forearmMmRange`, `wingspanCmRange`, `weightGRange` (each `{ "min": Double, "max": Double }`), `color` (free text). |
| `morphology` | Object? | `earType`, `tailType`, `noseType` (free text), `otherFeatures` (array of short strings). |
| `echolocation` | Object? | `callType` (e.g. `"FM"`, `"CF-FM"`), `peakFreqHzRange` (Pf), `characteristicFreqHzRange` (Cf/knee), `freqHighHzRange` (Fhigh), `freqLowHzRange` (Flow), `durationMsRange` — all `{ "min", "max" }` pairs in Hz/ms — plus free-text `notes` and an optional `exemplarImageName` (must match a bundled app image asset; leave unset if you don't have one). |
| `conservation` | Object? | `iucnStatus` (e.g. `"Least Concern"`), `localStatus` (free text, varies by region/authority). |
| `habits` | Object? | `roosting`, `migration`, `feeding`, `reproduction`, `other` — each free text. |
| `references` | [String]? | Citations, rendered verbatim in small type at the foot of the species page. Any format is fine as long as it's readable e.g. `"Author, A. (Year) Title. Journal, Vol(Issue), pages."` |
| `contributors` | [Contributor]? | Edit history shown via a sheet at the top of the References section. **The first entry is treated as the page's creator; every entry after that is an editor.** Each is `{ "name": String, "date": String (ISO 8601), "note": String? }` — add one entry (with today's date and a short note on what you changed) every time you edit a species you didn't create. |

### Example entry

```json
{
  "id": "myotis-daubentonii",
  "commonName": "Daubenton's Bat",
  "scientificName": "Myotis daubentonii",
  "order": "Chiroptera",
  "family": "Vespertilionidae",
  "regions": ["uk-ireland", "continental-europe"],
  "summary": "A small, agile bat that trawls for insects low over still or slow-moving water, using its large feet and tail membrane.",
  "echolocation": {
    "callType": "FM",
    "peakFreqHzRange": { "min": 45000, "max": 50000 },
    "durationMsRange": { "min": 2.0, "max": 5.0 },
    "notes": "Steep, broadband FM sweep; often confused with other Myotis species without call context."
  },
  "conservation": {
    "iucnStatus": "Least Concern"
  },
  "references": [
    "Jones, G. & Rayner, J.M.V. (1988) Flight performance, foraging tactics and echolocation in free-living Daubenton's bats. Journal of Zoology, 215(1), 113–132."
  ],
  "contributors": [
    { "name": "Jane Doe", "date": "2026-07-01T00:00:00Z", "note": "Created species profile" },
    { "name": "John Smith", "date": "2026-07-06T00:00:00Z", "note": "Added echolocation measurements" }
  ]
}
```

The first `contributors` entry (Jane Doe here) is the creator; anyone else who
later edits the entry appends their own `{ name, date, note }` after it,
don't overwrite or remove earlier entries.

See existing entries in `SpeciesGuideData.json` for more complete, real
examples.

### Versioning

- **`dataVersion`**: bump this by 1 for *any* content change, new species,
  corrected text, a new reference, anything. The app compares this number
  to decide whether to adopt your update; if you forget to bump it, your
  change won't reach anyone's device even after merging.
- **`updatedAt`**: an ISO 8601 timestamp set alongside every `dataVersion`
  bump, shown in the app's guide footer so users can see how fresh the data
  is.
- **`schemaVersion`**: this is *not* a content-versioning field, leave it
  alone. It only changes when the JSON's *structure* changes in a way old
  app versions can't safely read (e.g. renaming or repurposing an existing
  field), and that requires a coordinated app release. Adding a new
  optional field (as most content contributions will) never needs a
  `schemaVersion` bump.

### What not to touch

Please don't rename or remove an existing region `id` or species `id` in
the same PR as unrelated content changes, other entries and, in the case
of species ids, potentially saved user data reference these by string, so a
rename should be its own deliberate PR.

## Species Range Maps

In addition to the **Species Guide Data**, this repo also holds
[`SpeciesRangeData.json`](./SpeciesRangeData.json) — the coordinates behind the
range maps. The app fetches it from this repo
(`SpeciesRangeStore.remoteURL`), so new versions reach installs without an app
update, exactly like the guide data.

**Please don't edit `SpeciesRangeData.json` by hand.** It is generated from
`SpeciesGuideData.json` by `tools/generate_species_range_data.py` in the app
repo, which queries GBIF for occurrence records and writes both files side by
side. Add your species to the guide data and the range data follows on the next
regeneration.

## Licence

The data in this repo is licensed **[CC BY 4.0](./LICENSE)** — reuse it,
including commercially, as long as you give credit. Credit "the OpenBat field
guide contributors" and link back here; per-species credit is recorded in each
entry's `contributors` array.

By opening a PR you agree your contribution is released under the same licence.

Two things this licence does **not** cover:

- **The OpenBat app.** It lives in [its own repo](https://github.com/NiallxD/OpenBat-App)
  and is source-available under a much more restrictive notice — readable, but
  all rights reserved. Nothing here grants any permission over the app's code.
- **Upstream GBIF terms.** `SpeciesRangeData.json` is derived from GBIF
  occurrence records whose publishers set their own conditions. CC BY 4.0 covers
  the compilation as published here; if you redistribute the range data, check
  the upstream sources.
