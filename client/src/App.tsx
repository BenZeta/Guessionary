import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import LobbyPage from "./views/LobbyPage";
import BaseLayout from "./views/BaseLayout";
import Game1Page from "./views/Game1Page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
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
            path="/game1/"
            element={<Game1Page />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
