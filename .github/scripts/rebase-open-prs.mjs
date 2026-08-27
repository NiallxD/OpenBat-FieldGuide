/*
 * Re-applies every open guide submission onto main after main moves.
 *
 * ## Why line-based merging isn't enough
 *
 * Not stamping the version fields stopped the conflicts that had nothing to do
 * with the change — two pull requests touching unrelated species used to
 * collide on `updatedAt` alone. What it can't help is where a NEW species is
 * inserted. The worker puts one before the first entry with a greater id, which
 * only separates two additions if an existing entry sorts between them. Two
 * bats in the same genus — myotis-evotis and myotis-volans — have nothing
 * between them, land on the same anchor, and conflict as surely as before.
 * Sorting the array made that anchor predictable, not distinct.
 *
 * Git is reading the guide as lines. This script reads it as species, which is
 * what it actually is: it takes the entries a pull request changed and splices
 * those into whatever main now says, so where they sit in the file stops
 * mattering.
 *
 * ## What it does per open `guide/*` pull request
 *
 *   1. Diff the branch against its merge base to find which species it changed.
 *   2. Splice exactly those into main's current guide.
 *   3. Commit that as a merge of main into the branch, and push.
 *
 * Step 3 is a merge rather than a rebase on purpose: the branch only ever gains
 * commits, so the push is a fast-forward and no contributor's branch is ever
 * rewritten under them.
 *
 * ## What it deliberately refuses to do
 *
 * If main has changed a species that the pull request also changed, it leaves
 * that pull request completely alone. Two people editing the same bat is a real
 * disagreement about the same text, and quietly resolving it in main's favour
 * would throw away a contribution that nobody ever saw. That one still wants a
 * human, and it is the only case that should.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const FILE = 'SpeciesGuideData.json';
const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const show = (ref) => JSON.parse(git('show', `${ref}:${FILE}`));
const byId = (guide) => new Map(guide.species.map((s) => [s.id, s]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function openGuidePRs() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/pulls?state=open&per_page=100`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'openbat-rebase-open-prs'
    }
  });
  if (!res.ok) throw new Error(`GitHub pulls -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const prs = await res.json();
  // Only the ones the submission worker opened. A hand-written pull request may
  // be doing something this script has no model of — restructuring the regions,
  // say — and re-splicing it species by species would quietly discard that.
  return prs.filter((p) => p.head.ref.startsWith('guide/') && p.head.repo?.full_name === REPO);
}

export function rebuild(branch) {
  const remote = `origin/${branch}`;
  const base = git('merge-base', 'origin/main', remote).trim();

  const baseGuide = show(base);
  const prGuide = show(remote);
  const mainGuide = show('origin/main');

  const baseById = byId(baseGuide);
  const mainById = byId(mainGuide);

  // What this pull request actually changed, as species rather than as lines.
  const changed = prGuide.species.filter((s) => !same(baseById.get(s.id), s));
  if (!changed.length) return { status: 'nothing-to-apply' };

  // Someone else got to the same bat first. Leave it for a human.
  const contested = changed
    .filter((s) => baseById.has(s.id) && !same(baseById.get(s.id), mainById.get(s.id)))
    .map((s) => s.id);
  if (contested.length) return { status: 'contested', contested };

  // Main's version fields carry through untouched — the stamp workflow owns
  // those, and a branch that writes them is the bug this all started with.
  const out = JSON.parse(JSON.stringify(mainGuide));
  for (const entry of changed) {
    const at = out.species.findIndex((s) => s.id === entry.id);
    if (at >= 0) out.species[at] = entry;
    else {
      const before = out.species.findIndex((s) => s.id > entry.id);
      out.species.splice(before < 0 ? out.species.length : before, 0, entry);
    }
  }

  const rebuilt = JSON.stringify(out, null, 2) + '\n';
  if (rebuilt === git('show', `${remote}:${FILE}`)) return { status: 'already-current' };

  // `-s ours` takes the branch's tree wholesale, so the merge itself can never
  // report a conflict; the file is then replaced with the splice above. The
  // result is an ordinary merge commit with the right content and two parents,
  // which is what keeps this a fast-forward push.
  git('checkout', '-q', '-B', 'rebuild', remote);
  git('merge', '-s', 'ours', '--no-commit', '--no-ff', 'origin/main');
  writeFileSync(FILE, rebuilt);
  git('add', FILE);
  git('commit', '-q', '-m',
    `Re-apply onto main\n\n` +
    `main moved while this was open. The ${changed.length === 1 ? 'entry' : 'entries'} ` +
    `this pull request changed (${changed.map((s) => s.id).join(', ')}) ` +
    `have been spliced into main's current guide, so the diff is that change and nothing else.`);
  git('push', '-q', 'origin', `rebuild:${branch}`);
  return { status: 'rebuilt', changed: changed.map((s) => s.id) };
}

// Importing this module to exercise `rebuild` against a scratch repository
// shouldn't reach for GitHub. The workflow sets nothing, so the run below is
// what normally happens.
if (process.env.REBASE_SELFTEST === '1') {
  console.log('self-test import: skipping the GitHub pass');
} else {

const prs = await openGuidePRs();
if (!prs.length) {
  console.log('No open guide pull requests.');
} else {
  git('fetch', '-q', 'origin', '+refs/heads/guide/*:refs/remotes/origin/guide/*');
  let failed = 0;
  for (const pr of prs) {
    try {
      const r = rebuild(pr.head.ref);
      const detail = r.contested ? ` (${r.contested.join(', ')} changed on main too)`
                   : r.changed  ? ` (${r.changed.join(', ')})` : '';
      console.log(`#${pr.number} ${pr.head.ref}: ${r.status}${detail}`);
    } catch (err) {
      // One unrebuildable pull request must not stop the others.
      failed++;
      console.error(`#${pr.number} ${pr.head.ref}: FAILED — ${err.message.split('\n')[0]}`);
    }
  }
  if (failed) process.exitCode = 1;
}

}
