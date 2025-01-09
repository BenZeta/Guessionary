import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "toastify-js/src/toastify.css";
import App from "./App.tsx";
import ThemeContext from "./context/ThemeContext.tsx";
import { ClickProvider } from "./context/ClickContext";

createRoot(document.getElementById("root")!).render(
  <ClickProvider>
    <StrictMode>
      <ThemeContext>
        <App />
      </ThemeContext>
    </StrictMode>
  </ClickProvider>
);
