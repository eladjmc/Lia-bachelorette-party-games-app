export interface AvatarDefinition {
  id: string;
  name: string;
  imagePath: string;
  /** Soft fallback color when image is missing */
  accent: string;
}

export const AVATARS: AvatarDefinition[] = [
  { id: "princess-01", name: "אריאל", imagePath: "/avatars/1.png", accent: "#F472B6" },
  { id: "princess-02", name: "בל", imagePath: "/avatars/2.png", accent: "#FBBF24" },
  { id: "princess-03", name: "סינדרלה", imagePath: "/avatars/3.png", accent: "#93C5FD" },
  { id: "princess-04", name: "יסמין", imagePath: "/avatars/4.png", accent: "#A78BFA" },
  { id: "princess-05", name: "אלזה", imagePath: "/avatars/5.png", accent: "#67E8F9" },
  { id: "princess-06", name: "אנה", imagePath: "/avatars/6.png", accent: "#FB7185" },
  { id: "princess-07", name: "רפונזל", imagePath: "/avatars/7.png", accent: "#FDE68A" },
  { id: "princess-08", name: "טיאנה", imagePath: "/avatars/8.png", accent: "#86EFAC" },
  { id: "princess-09", name: "מולאן", imagePath: "/avatars/9.png", accent: "#FCA5A5" },
  { id: "princess-10", name: "פוקהונטס", imagePath: "/avatars/10.png", accent: "#D9F99D" },
  { id: "princess-11", name: "אורורה", imagePath: "/avatars/11.png", accent: "#F9A8D4" },
  { id: "princess-12", name: "מרידה", imagePath: "/avatars/12.png", accent: "#FDBA74" },
];

export function getAvatarById(id: string): AvatarDefinition | undefined {
  return AVATARS.find((a) => a.id === id);
}
