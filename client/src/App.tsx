import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import LobbyPage from "./views/LobbyPage";
import BaseLayout from "./views/BaseLayout";
import Game2Page from "./views/Game2Page";
import Game1Page from "./views/Game1Page";
import Game2Page from "./views/Game2Page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<BaseLayout />}>
          
          <Route index element={<HomePage />} />
          <Route path="/game/:roomId" element={<Game1Page />} />
          <Route path="/draw/:roomId/:gameId" element={<Game2Page />} />
          <Route
            path="/lobby/:roomId"
            element={<LobbyPage />}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
