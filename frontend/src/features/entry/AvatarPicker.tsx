import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AVATARS } from "./avatars";
import { cn } from "@/utils/classnames";

interface AvatarPickerProps {
  value: string | null;
  takenIds: string[];
  onChange: (avatarId: string) => void;
}

export function AvatarPicker({ value, takenIds, onChange }: AvatarPickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-brand-900">{t("entry.avatar")}</p>
      <div className="grid grid-cols-4 gap-2.5">
        {AVATARS.map((avatar) => {
          const taken = takenIds.includes(avatar.id) && value !== avatar.id;
          const selected = value === avatar.id;
          return (
            <motion.button
              key={avatar.id}
              type="button"
              disabled={taken}
              whileTap={taken ? undefined : { scale: 0.94 }}
              onClick={() => onChange(avatar.id)}
              className={cn(
                "relative flex aspect-square touch-target items-center justify-center overflow-hidden rounded-2xl border-2 p-1 shadow-soft transition-colors",
                selected && "border-gold bg-brand-50 ring-2 ring-gold/40",
                !selected && !taken && "border-white bg-white/90",
                taken && "cursor-not-allowed border-ink/20 bg-ink/5 grayscale",
              )}
              aria-label={taken ? `${avatar.name} — ${t("entry.avatarTaken")}` : avatar.name}
              style={{ backgroundColor: selected ? undefined : `${avatar.accent}22` }}
            >
              <img
                src={avatar.imagePath}
                alt=""
                className={cn("h-[92%] w-[92%] rounded-xl object-cover", taken && "opacity-45")}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {taken && (
                <span className="absolute inset-x-1 bottom-1 rounded-md bg-ink/80 py-0.5 text-center text-[10px] font-semibold text-white">
                  {t("entry.avatarTaken")}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
