import type { PlayerRole } from "@/types/session.types";

const TOKEN_KEY = "party_player_token";
const PROFILE_KEY = "party_player_profile";

export interface StoredProfile {
  displayName: string;
  avatarId: string;
  role: PlayerRole;
}

export function getPlayerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setPlayerToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearPlayerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getPlayerProfile(): StoredProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function setPlayerProfile(profile: StoredProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearPlayerProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function clearSessionStorage(): void {
  clearPlayerToken();
  clearPlayerProfile();
}
