import { useNavigate } from "react-router";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await axios.delete(`${baseUrl}/delete-user`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <nav className="sticky top-0 flex justify-between items-center p-4 bg-purple-800 z-50">
      <button
        onClick={handleLogout}
        className="border-2 border-black/20 rounded-xl bg-black/10 p-2 text-white"
      >
        Back to Home
      </button>
      <h1 className="text-2xl text-white font-bold">Welcome to Game Rooms</h1>
    </nav>
  );
}
