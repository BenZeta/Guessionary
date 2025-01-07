import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";
import LoginPage from "./views/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
