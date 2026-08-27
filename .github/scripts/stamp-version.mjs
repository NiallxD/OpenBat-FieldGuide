/*
 * Bumps the field guide's version fields on `main`, after a merge.
 *
 * These used to be written by the submission worker, into the pull request
 * branch itself. That made every pair of open pull requests conflict: two
 * submissions off the same base bump `dataVersion` to the same number, which
 * git accepts as agreement, but each stamped its own `updatedAt`, so the moment
 * one merged, every other open pull request differed from `main` on that one
 * line. The species involved didn't matter — unrelated edits collided.
 *
 * Doing it here instead means a branch never touches these lines, and the
 * number counts what actually landed rather than what was submitted.
 *
 * Key order is preserved because the fields already exist and are only
 * reassigned; the file is rewritten in the same canonical shape the worker
 * commits, so the diff is these two lines and nothing else.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'SpeciesGuideData.json';

const guide = JSON.parse(readFileSync(FILE, 'utf8'));

guide.dataVersion = (Number(guide.dataVersion) || 0) + 1;
guide.updatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

writeFileSync(FILE, JSON.stringify(guide, null, 2) + '\n');

console.log(`dataVersion -> ${guide.dataVersion} (${guide.updatedAt})`);
