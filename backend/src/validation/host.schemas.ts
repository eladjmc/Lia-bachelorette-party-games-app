import { z } from "zod";
import { GAME_TYPES } from "../constants/game.constants.js";

export const startGameSchema = z.object({
  playerToken: z.string().min(1),
  gameType: z.enum([
    GAME_TYPES.TRIVIA,
    GAME_TYPES.PASS_THE_PARCEL,
    GAME_TYPES.TRUTH_OR_DARE,
  ]),
});

export const hostActionSchema = z.object({
  playerToken: z.string().min(1),
});

export type StartGameInput = z.infer<typeof startGameSchema>;
export type HostActionInput = z.infer<typeof hostActionSchema>;
