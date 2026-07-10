import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router";
import { Providers } from "./providers";
import { useReconnect } from "@/hooks/useReconnect";
import { useSocket } from "@/hooks/useSocket";

function AppEffects() {
  useSocket();
  useReconnect();
  return <AppRouter />;
}

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppEffects />
      </BrowserRouter>
    </Providers>
  );
}
