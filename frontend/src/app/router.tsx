import { Navigate, Route, Routes } from "react-router-dom";
import { EntryPage } from "@/features/entry/EntryPage";
import { SessionPage } from "@/features/session/SessionPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/session" element={<SessionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
