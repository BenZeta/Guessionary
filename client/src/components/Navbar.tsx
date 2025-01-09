import { useNavigate } from "react-router";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useSound } from "../context/SoundContext";
import { socket } from "../socket/socket";

export default function Navbar() {
  const navigate = useNavigate();
  const { isPlaying, toggleAudio } = useSound();

  async function handleLogout() {
    try {
      socket.disconnect();

      const { data } = await axios.delete(`${baseUrl}/delete-user`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      localStorage.clear();
      navigate("/login");

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <nav className="flex justify-center h-full items-center bg-hidden  w-full p-5 gap-x-20 bg-purple-800">
      <button onClick={handleLogout}>
        <img
          src="https://ik.imagekit.io/matguchi18/logout.png?updatedAt=1736431150090"
          alt="logout"
          className="w-10 animate-bounceUp"
        />
        <span className="font-bold text-sm text-white animate-bounceUp">Logout</span>
      </button>

      <a href="/">
        <img
          src="https://ik.imagekit.io/3a0xukows/home.png?updatedAt=1736350418372"
          alt="home"
          className="w-10 animate-bounceUp "
        />
        <span className="font-bold text-sm text-white animate-bounceUp">Home</span>
      </a>

      <button onClick={toggleAudio}>
        <img
          src="https://ik.imagekit.io/3a0xukows/wave-sound.png?updatedAt=1736351115020"
          alt="sound"
          className="w-10 animate-bounceUp "
        />
        <span className="font-bold text-sm text-white animate-bounceUp">{isPlaying ? "Pause Audio" : "Play Audio"}</span>
      </button>
    </nav>
  );
}
