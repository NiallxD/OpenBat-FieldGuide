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
| `code` | String? | The species' 4- or 6-letter classifier code — the same short label an OpenBat ID model uses on a detection (e.g. `"PIPPIP"`, `"MYCA"`). **Optional if a bundled ID model already names this species** — the app looks that code up automatically, so leave it unset and one less thing to keep in sync. **Required if no model names it yet** — see "Species Codes" below; without one, this entry gets no distribution map and never appears in "bats near you", because there's nothing to fetch range data under. |
| `imageURL` | String? | Direct URL to a photo of the species, shown as the hero image on its page. **Must link a Creative Commons–licensed or public-domain image — see "Species Photos" below before adding one.** Leave unset and the app falls back to a live Wikipedia lookup, which is unpredictable (wrong species, a range map instead of a photo, or nothing at all) — setting this is how you fix that for good. |
| `imageCredit` | String? | Attribution text shown over the photo, e.g. `"Jane Doe, Wikimedia Commons, CC BY-SA 4.0"`. **Required whenever `imageURL` is set** — see "Species Photos" below. Ignored if `imageURL` is unset. |
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
  "imageURL": "https://upload.wikimedia.org/wikipedia/commons/x/xx/Myotis_daubentonii_example.jpg",
  "imageCredit": "Jane Doe, Wikimedia Commons, CC BY-SA 4.0",
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

### Species Photos

`imageURL` must link an image you have the right to use — in practice, that
means **Creative Commons–licensed or public domain**. Wikimedia Commons is
the easiest source: open the file's page there, and both the licence and the
exact attribution to use are listed on it directly.

- **No All Rights Reserved images.** Not a photo you found on a search
  engine, a stock photo site, a blog, or social media, unless its own listed
  licence is CC or public domain. If you can't find a clear licence statement
  for an image, don't use it.
- **Set `imageCredit` to match.** Whatever the source names as the required
  attribution — typically photographer, source, and licence, e.g.
  `"Jane Doe, Wikimedia Commons, CC BY-SA 4.0"`. A CC licence is permission to
  use the image, not a waiver of the credit it requires; an `imageURL`
  without a matching `imageCredit` is an incomplete entry, not a finished one.
- **Link the image file directly**, not the page it's embedded on — `imageURL`
  needs to resolve straight to image bytes (a `.jpg`/`.png`/etc. URL) so the
  app can load it. On a Wikimedia Commons file page, that's the "Original
  file" link, not the page URL itself.
- **Leave both fields unset if you don't have a suitable image.** The app
  falls back to a live Wikipedia lookup for any entry without one — imperfect,
  but a reasonable placeholder until someone adds a real `imageURL`.

### Own words

Facts cited, phrasing original — the same shape as the image rule above,
applied to text instead of pictures.

- **Read the source, then write the entry from what you learned**, not from
  the source's sentences with a few words swapped. A field guide, handbook,
  or paper is a fine thing to build an entry from; copying its wording is not,
  even with a citation in `references` — a citation says where a fact came
  from, it doesn't license reusing the prose that stated it.
- **A `references` entry is not an attribution for copied text.** It's a
  pointer for a reader who wants to verify a claim or go deeper, and it's
  required either way — but it doesn't turn quoting a source into something
  this guide's CC BY-NC 4.0 licence can relicense onward. Nobody who reuses this
  guide's data should end up redistributing someone else's handbook text
  without knowing it.
- **A short, genuinely unparaphraseable technical term or measurement is
  fine** — "peak frequency ~55 kHz" isn't going to read differently no matter
  who writes it. What this rule is aimed at is sentence- and paragraph-level
  phrasing, not facts or terms of art.

### Species Codes

`code` is what lets an entry get a distribution map and show up in "bats near
you" — the app's presence-data generator uses it as the key to fetch and
store range data under, the same way it already does for every species one
of OpenBat's ID models can name.

- **Check first whether one already exists.** If this species is named by a
  bundled ID model, it already has a code — leave `code` unset and the app
  finds it automatically. Setting it anyway isn't wrong, just redundant; the
  entries most likely to need this field are ones the models don't cover at
  all.
- **Every bat has a code, whether or not a model uses it yet.** If this
  species is genuinely new to the guide — no ID model names it — you're
  assigning it a code for the first time. Pick something that reads like the
  existing ones: 4 letters (NABat style, e.g. `MYCA`) or 6 (BatDetect2 style,
  e.g. `PIPPIP`), usually built from the genus and species name.
- **It must be unique.** A code that collides with an existing one — a
  model's, or another guide entry's — points range data at the wrong species,
  and the generator that builds it refuses to run until that's fixed. If
  you're not sure whether a code is taken, open an issue or ask before
  guessing.
- **Setting a code doesn't teach the app to identify this species.** It only
  unlocks the map and the near-you list; ID happens entirely inside the
  bundled classifier models, which this repo doesn't control.

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

## Species Presence Data

In addition to the **Species Guide Data**, this repo also holds
[`SpeciesPresenceData.json`](./SpeciesPresenceData.json) — a coarse global grid
of where each species actually lives. The app fetches it from this repo, so new
versions reach installs without an app update, exactly like the guide data. It
does two jobs at once: it draws the distribution map on a species' page, and it
decides which species the app's on-device ID engine considers plausible at the
user's location.

**Please don't edit `SpeciesPresenceData.json` by hand.** It's generated by
`tools/generate_species_presence_data.py` in the app repo, which queries GBIF
for occurrence records for every species that has a `code` — either an ID
model's own species list, or a guide entry that's set its `code` field (see
"Species Codes" above) for a species no model names. Add a species to the
guide with a `code`, or wait for a model to add one, and it's picked up
automatically next time someone regenerates.

`SpeciesRangeData.json`, an older per-occurrence-point format this repo used to
hold, is gone — nothing in the app has read it since 2026-08-16, when it was
replaced outright by the grid above.

## Licence

The data in this repo is licensed **[CC BY-NC 4.0](./LICENSE)** — reuse it
for non-commercial purposes as long as you give credit; commercial reuse
(including bulk import into another product or service) needs the copyright
holder's permission. Credit "the OpenBat field guide contributors" and link
back here; per-species credit is recorded in each entry's `contributors`
array. [`NOTICE`](./NOTICE) states the scope and attribution terms in full.

Changed 2026-08-17 from CC BY 4.0, specifically to stop contributed entries
being scraped and resold by a commercial competitor — not retroactive for
copies already lawfully made under the earlier licence.

By opening a PR you agree your contribution is released under the same licence.

Two things this licence does **not** cover:

- **The OpenBat app.** It lives in [its own repo](https://github.com/NiallxD/OpenBat-App)
  and is source-available under a much more restrictive notice — readable, but
  all rights reserved. Nothing here grants any permission over the app's code.
- **Upstream GBIF terms.** `SpeciesPresenceData.json` is derived from GBIF
  occurrence records whose publishers set their own conditions. CC BY-NC 4.0
  covers the compilation as published here; if you redistribute the presence
  data, check the upstream sources.
