import { z } from "zod";
import { MAX_DISPLAY_NAME_LENGTH, MIN_DISPLAY_NAME_LENGTH } from "../constants/app.constants.js";
import { VALID_AVATAR_IDS } from "../data/avatars.js";

const avatarIdSchema = z.enum(VALID_AVATAR_IDS);

export const joinGuestSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(MIN_DISPLAY_NAME_LENGTH)
    .max(MAX_DISPLAY_NAME_LENGTH),
  avatarId: avatarIdSchema,
});

export const joinHostSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(MIN_DISPLAY_NAME_LENGTH)
    .max(MAX_DISPLAY_NAME_LENGTH),
  avatarId: avatarIdSchema,
  password: z.string().min(1),
});

export const reconnectSchema = z.object({
  playerToken: z.string().min(1),
});

export const leaveSchema = z.object({
  playerToken: z.string().min(1),
});

export type JoinGuestInput = z.infer<typeof joinGuestSchema>;
export type JoinHostInput = z.infer<typeof joinHostSchema>;
export type ReconnectInput = z.infer<typeof reconnectSchema>;
export type LeaveInput = z.infer<typeof leaveSchema>;
