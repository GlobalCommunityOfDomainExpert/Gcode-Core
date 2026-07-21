import { REACTION_EMOJIS } from "@/lib/api/ratings";

// Baseline: at 0 registered attendees, no bots at all — an empty event
// shouldn't fake engagement out of nothing. Scaling: sqrt(registeredCount),
// not linear — gives low/mid-size events a relatively livelier rate instead
// of feeling dead, while still tapering off at large ones. Coefficient tuned
// so 100 registered attendees lands on a mean of ~15/sec (900/min).
const SQRT_COEFFICIENT = 900 / Math.sqrt(100);
const MAX_BOTS_PER_MINUTE = 3000; // 50/sec ceiling, only reachable ~1100+ attendees

function expectedBotsPerMinute(registeredCount: number): number {
  const raw = SQRT_COEFFICIENT * Math.sqrt(Math.max(registeredCount, 0));
  return Math.min(raw, MAX_BOTS_PER_MINUTE);
}

// Relative weights, not uniform — a real crowd claps/fires up far more than
// it laughs or thumbs-ups a live performance, so an even 1-in-5 draw across
// REACTION_EMOJIS would read as obviously synthetic. Order matches
// REACTION_EMOJIS ["👏","🔥","❤️","😂","👍"].
const EMOJI_WEIGHTS = [5, 4, 3, 1, 2] as const;
const TOTAL_WEIGHT = EMOJI_WEIGHTS.reduce((a, b) => a + b, 0);

function pickWeightedEmoji(): string {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < REACTION_EMOJIS.length; i++) {
    roll -= EMOJI_WEIGHTS[i];
    if (roll <= 0) return REACTION_EMOJIS[i];
  }
  return REACTION_EMOJIS[REACTION_EMOJIS.length - 1];
}

// Ephemeral by design — never persisted to the DB, generated fresh on every
// poll tick in the reactions stream route, entirely server-side. Bots never
// depend on any attendee's own device or the venue's WiFi — they keep the
// scoreboard looking alive even if real taps can't reach the server at all.
// Converts the per-minute rate into a Poisson-sampled count for this tick's
// window, so bots arrive in a naturally uneven, bursty way (some ticks 0,
// some a cluster) rather than a robotic fixed cadence.
export function generateBotReactions(
  registeredCount: number,
  tickMs: number,
): { emoji: string }[] {
  const perMinute = expectedBotsPerMinute(registeredCount);
  const expectedThisTick = perMinute * (tickMs / 60_000);
  if (expectedThisTick <= 0) return [];

  // Knuth's algorithm — cheap for the small expected values this produces.
  let count = 0;
  let p = 1;
  const l = Math.exp(-expectedThisTick);
  do {
    count++;
    p *= Math.random();
  } while (p > l);
  count -= 1;

  return Array.from({ length: count }, () => ({ emoji: pickWeightedEmoji() }));
}
