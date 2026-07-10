import { z } from "zod";

export const submitAnswerSchema = z.object({
  playerToken: z.string().min(1),
  optionId: z.string().min(1),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
