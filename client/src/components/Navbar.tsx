import { useNavigate } from "react-router";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSound } from "../context/SoundContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");
  const { isPlaying, toggleAudio } = useSound();

  async function handleLogout() {
    try {
      if (role === "Staff") {
        await axios.delete(`${baseUrl}/delete-user`, {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        });
      }

      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  async function getUserDetail() {
    try {
      const { data } = await axios.get(`${baseUrl}/user_detail`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRole(data.role);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUserDetail();
  }, []);

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
