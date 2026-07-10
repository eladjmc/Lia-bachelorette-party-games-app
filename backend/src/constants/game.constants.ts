export const GAME_TYPES = {
  TRIVIA: "trivia",
  PASS_THE_PARCEL: "pass_the_parcel",
  TRUTH_OR_DARE: "truth_or_dare",
} as const;

export const GAME_COUNTDOWN_MS = 10_000;

export const SPIN_DURATION_MS = 4000;

export const TRUTH_PROBABILITY = 0.75;
export const DARE_PROBABILITY = 0.25;

export const HOST_DARE_ID = "host-dare-chaser";
export const HOST_DARE_TEXT = "חובה עלייך - לשתות צ'ייסר";

export const HOST_PASSWORD_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60_000,
} as const;
