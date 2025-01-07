import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./views/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
