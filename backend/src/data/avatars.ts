export const VALID_AVATAR_IDS = [
  "princess-01",
  "princess-02",
  "princess-03",
  "princess-04",
  "princess-05",
  "princess-06",
  "princess-07",
  "princess-08",
  "princess-09",
  "princess-10",
  "princess-11",
  "princess-12",
] as const;

export type AvatarId = (typeof VALID_AVATAR_IDS)[number];

export function isValidAvatarId(id: string): id is AvatarId {
  return (VALID_AVATAR_IDS as readonly string[]).includes(id);
}
