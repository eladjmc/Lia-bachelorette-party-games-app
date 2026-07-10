import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/animations/FadeIn";
import { EntryForm } from "./EntryForm";

export function EntryPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-princess-entry min-h-dvh w-full">
      <main className="safe-pad mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
      <FadeIn>
        <header className="mb-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 sparkle inline-block">
            {t("app.title")}
          </p>
          <h1 className="title-display mt-2 text-3xl leading-snug">{t("entry.title")}</h1>
          <p className="mt-2 text-brand-800/70">{t("entry.subtitle")}</p>
        </header>
        <div className="glass-card p-5">
          <EntryForm />
        </div>
      </FadeIn>
    </main>
    </div>
  );
}
