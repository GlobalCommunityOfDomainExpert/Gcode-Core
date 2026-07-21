import { REACTION_EMOJIS } from "@/lib/api/ratings";

// Baseline: at 0 registered attendees, no bots at all — an empty event
// shouldn't fake engagement out of nothing. Scaling: +1 expected bot-tap per
// minute for every 20 registered attendees, capped so a huge event doesn't
// turn into a snowstorm of emoji.
const BOTS_PER_MINUTE_PER_20_ATTENDEES = 1;
const MAX_BOTS_PER_MINUTE = 40;

function expectedBotsPerMinute(registeredCount: number): number {
  const raw = (registeredCount / 20) * BOTS_PER_MINUTE_PER_20_ATTENDEES;
  return Math.min(raw, MAX_BOTS_PER_MINUTE);
}

// Ephemeral by design — never persisted to the DB, generated fresh on every
// poll tick in the reactions stream route. Converts the per-minute rate into
// a Poisson-sampled count for this tick's window, so bots arrive in a
// naturally uneven, bursty way rather than a robotic fixed cadence.
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

  return Array.from({ length: count }, () => ({
    emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
  }));
}
