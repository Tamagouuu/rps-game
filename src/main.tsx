import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { WebSocketProvider } from "./websocket/WebSocketProvider";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </StrictMode>
  </BrowserRouter>
);
