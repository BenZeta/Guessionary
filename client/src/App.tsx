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
        <Route
          path="/game/:roomId"
          element={<GamePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
