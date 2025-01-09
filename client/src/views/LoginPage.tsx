import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Avatar } from "../helpers/Avatar.ts";
import WordsLoading from "../components/Loading.tsx";

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadingTimer = setTimeout(() => setLoading(false), 4000);
    if (localStorage.access_token) {
      Swal.fire({
        title: "You are already logged in",
        text: "Do you want to continue?",
        icon: "warning",
        confirmButtonText: "Continue",
      });
      navigate("/");
    }
    return () => clearTimeout(loadingTimer);
  }, [navigate]);

  const handleNextAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % Avatar.length); // Cycle to next avatar
  };

  const handlePrevAvatar = () => {
    setAvatarIndex((prev) => (prev - 1 + Avatar.length) % Avatar.length); // Cycle to previous avatar
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const selectedAvatar = Avatar[avatarIndex];
      const { data } = await axios.post(baseUrl + "/login", {
        avatar: selectedAvatar,
        username,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("avatar", selectedAvatar);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      Swal.fire({
        title: "Login Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
      });
    }
  };

  const prevIndex = (avatarIndex - 1 + Avatar.length) % Avatar.length;
  const nextIndex = (avatarIndex + 1) % Avatar.length;

  return (
    <>
      {loading ? (
        <WordsLoading />
      ) : (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] relative">
      {/* Header */}

      <div className="flex items-center bg-hidden">
        <a href="/login" className="absolute top-4 left-10">
          <img
            className="h-20"
            src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299"
            alt="logo"
          />
        </a>
        <h1 className="text-3xl text-white font-bold font-sans absolute top-9 left-28 ">
          Guessionary
        </h1>
      </div>
      <button className="bg-white border rounded-3xl w-28 h-10 absolute top-10 right-14">
        Theme
      </button>
      {/* Main */}
      <div className="flex flex-col justify-center items-center h-full">
        {/* Navbar */}
        <div className="flex justify-center items-center bg-white border rounded-3xl w-96 h-14">
          NAVBAR
        </div>
        <form onSubmit={handleLogin}>
          {/* Avatar */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Prev Avatar */}
            <div className="transition-transform duration-500 transform scale-75 opacity-60">
              <img
                src={Avatar[prevIndex]}
                alt="Previous avatar"
                className="w-40 h-40 rounded-full"
              />
            </div>
            {/* Current Avatar */}
            <div className="mt-8 flex flex-col items-center">
              <img
                className="w-40 h-40 rounded-full"
                src={Avatar[avatarIndex]}
                alt="Selected avatar"
              />
            </div>
            {/* Next Avatar */}
            <div className="transition-transform duration-500 transform scale-75 opacity-60">
              <img
                src={Avatar[nextIndex]}
                alt="Next avatar"
                className="w-40 h-40 rounded-full"
              />
            </div>
          </div>
          {/* Button Avatar */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              type="button"
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-700"
              onClick={handlePrevAvatar}
            >
              ‹
            </button>
            <button
              type="button"
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-700"
              onClick={handleNextAvatar}
            >
              ›
            </button>
          </div>

          {/* Nickname Input and Button */}
          <div className="relative flex justify-center items-center mt-4">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Nickname"
                className="bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] border-2 border-white rounded-3xl w-full h-12 pl-4 pr-20"
                id="username"
                autoComplete="current-username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ffff00] border rounded-3xl w-16 h-8 text-sm"
              >
                Start
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    )}
  </>
  );
}
