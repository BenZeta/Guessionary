import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import LobbyPage from "./views/LobbyPage";
import BaseLayout from "./views/BaseLayout";
import Game1Page from "./views/Game1Page";
import Game2Page from "./views/Game2Page";
import CardPage from "./views/CardPage";
import { useContext } from "react";
import { themeContext } from "./context/ThemeContext";
import { SoundProvider } from "./context/SoundContext"; // Import the SoundProvider

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

  return (
    <SoundProvider>
      <div className={theme[currentTheme].bgColor}>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </SoundProvider>
  );
}
