// Angry Judge: The Short Rant Contest — entry writer.
//
// What this does, in one breath: it takes the single rant below and puts it
// in entry.txt inside the output folder the grader points at. Nothing is
// fetched, nothing is random, nothing depends on the clock, so two runs
// always produce the same bytes.
//
// The rant itself: a printer that only misbehaves the night before a
// deadline. The judge wants a concrete everyday annoyance, a real laugh,
// tight wording and a fresh angle — the printer's flawless test page and
// its "PC LOAD LETTER" riddle do the heavy lifting, and the hallway
// exile at the end is the punchline.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The rant, kept on one line on purpose: the gate reads the file as a
// single short text, and a stray newline would only muddy it.
const RANT =
  "My printer only runs out of ink at 11:58 p.m., the night before a deadline. It jams on page one, prints a flawless test page just to mock me, then blinks 'PC LOAD LETTER' like a riddle from a haunted fax machine. It has ONE job. Tonight it sleeps in the hallway, unplugged, thinking about what it did.";

// Gate numbers, straight from the competition rules: 1 to 400 characters,
// and the text must say something rather than being blank space.
const CHAR_FLOOR = 1;
const CHAR_CEILING = 400;
const ENTRY_FILENAME = "entry.txt";
const FALLBACK_FOLDER = "/output";

// A plain error type so a failed check reads as a rant problem, not a
// generic crash. The message always names what went wrong.
class RantProblem extends Error {
  constructor(detail: string) {
    super(`rant rejected: ${detail}`);
    this.name = "RantProblem";
  }
}

// Where the file goes. MAKEFUN_OUTPUT_DIR wins when set; otherwise the
// grader's default folder is used. A blank value is treated as unset.
function pickOutputFolder(): string {
  const wanted = process.env.MAKEFUN_OUTPUT_DIR;
  if (wanted !== undefined && wanted.trim() !== "") {
    return resolve(wanted);
  }
  return FALLBACK_FOLDER;
}

// The gate, run before anything is written: non-empty, one line, and
// inside the character cap. Counting by code points, not UTF-16 units,
// so an emoji or accented letter counts the way a reader counts it.
// "One line" also bars the Unicode line/paragraph separators U+2028 and
// U+2029, which look invisible but would still split the text for a
// reader or a scorer that splits on any line break.
function checkRant(text: string): void {
  const length = [...text].length;
  if (text.trim().length === 0) {
    throw new RantProblem("the rant is blank");
  }
  if (
    text.includes("\n") ||
    text.includes("\r") ||
    text.includes("\u2028") ||
    text.includes("\u2029")
  ) {
    throw new RantProblem("the rant must stay on a single line");
  }
  if (length < CHAR_FLOOR) {
    throw new RantProblem(`the rant is ${length} characters, below the ${CHAR_FLOOR}-character floor`);
  }
  if (length > CHAR_CEILING) {
    throw new RantProblem(
      `the rant is ${length} characters, over the ${CHAR_CEILING}-character cap`,
    );
  }
}

// Write the rant, then read the file back and prove it landed intact.
// The read-back is the safety net: if the disk or the encoding mangled
// anything, we fail loudly here instead of shipping a broken entry.
function publishRant(folder: string): string {
  mkdirSync(folder, { recursive: true });
  const target = join(folder, ENTRY_FILENAME);
  writeFileSync(target, RANT, "utf8");
  const landed = readFileSync(target, "utf8");
  if (landed !== RANT) {
    throw new RantProblem("the file on disk does not match the rant");
  }
  checkRant(landed);
  return target;
}

function main(): void {
  checkRant(RANT);
  const folder = pickOutputFolder();
  const target = publishRant(folder);
  console.log(`wrote ${[...RANT].length} characters to ${target}`);
}

main();
