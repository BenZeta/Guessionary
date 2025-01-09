import { useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router"; // Use react-router-dom
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import LobbyPage from "./views/LobbyPage";
import BaseLayout from "./views/BaseLayout";
import Game1Page from "./views/Game1Page";
import Game2Page from "./views/Game2Page";
import CardPage from "./views/CardPage";
import { themeContext } from "./context/ThemeContext";
import { SoundProvider } from "./context/SoundContext";
import { clickSound } from "./context/ClickContext"; // Removed unnecessary ClickProvider import
import Game3Page from "./views/Game3Page";

type Theme = {
  light: {
    bgColor: string;
  };
  dark: {
    bgColor: string;
  };
};

export default function App(): JSX.Element {
  const { currentTheme, theme } = useContext(themeContext) as {
    currentTheme: keyof Theme;
    theme: Theme;
  };

  const { playClickSound } = clickSound();

  useEffect(() => {
    const handleClick = () => {
      playClickSound(); // Play sound on every click
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [playClickSound]);

  return (
    <SoundProvider>
      <div className={theme[currentTheme]?.bgColor || "default-bg-color"}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/avatars"
              element={<CardPage />}
            />
            <Route element={<BaseLayout />}>
              <Route
                index
                element={<HomePage />}
              />
              <Route
                path="/lobby/:roomId"
                element={<LobbyPage />}
              />
              <Route
                path="/round_1/:roomId/:gameId"
                element={<Game1Page />}
              />
              <Route
                path="/draw/:roomId/:gameId"
                element={<Game2Page />}
              />
              <Route
                path="/round_3/:roomId/:gameId"
                element={<Game3Page />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </SoundProvider>
  );
}
