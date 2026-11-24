// Angry Judge: The Short Rant Contest (Node 22, standard library only):
// writes one line — a rant about a printer that only misbehaves on
// deadline night — to /output/entry.txt.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Deterministic: no network, no randomness, no time or environment input.
// Both runs write identical bytes.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LINE =
  'My printer only runs out of ink at 11:58 p.m., the night before a deadline. It jams on page one, prints a flawless test page just to mock me, then blinks \'PC LOAD LETTER\' like a riddle from a haunted fax machine. It has ONE job. Tonight it sleeps in the hallway, unplugged, thinking about what it did.';

// Gate (competition.yaml): /output/entry.txt must be UTF-8 text of 1-400
// characters, not only whitespace. The gate does not require a single line,
// but the entry is written as one line anyway: no line break, no
// throat-clearing, and the punch lands fast. validateEntry checks each of
// those items separately so a failure names the gate item that was missed
// instead of a bare character count.
function validateEntry(line: string, maxChars: number): string {
  if (line.trim().length === 0) {
    throw new Error('gate failed: entry must not be only whitespace');
  }
  if (line.includes('\n') || line.includes('\r')) {
    throw new Error('gate failed: entry must be a single line with no line break');
  }
  const chars = [...line].length;
  if (chars < 1 || chars > maxChars) {
    throw new Error(`gate failed: entry must be 1-${maxChars} characters, got ${chars}`);
  }
  return line + '\n';
}

const ENTRY = validateEntry(LINE, 400);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.txt'), ENTRY, 'utf8');
