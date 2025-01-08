import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";
import GamePage from "./views/GamePage";
import BaseLayout from "./views/BaseLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<BaseLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/game/:roomId" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
