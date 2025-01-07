import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import GamePage from "./views/GamePage";
import Game2Page from "./views/Game2Page";
import Game3Page from "./views/Game3Page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/game/" element={<GamePage />} />
        <Route path="/game2/" element={<Game2Page />} />
        <Route path="/game3/" element={<Game3Page />} />
      </Routes>
    </BrowserRouter>
  );
}
