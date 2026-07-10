import { useTranslation } from "react-i18next";

export function ErrorBanner({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
      {message || t("app.error")}
    </div>
  );
}
