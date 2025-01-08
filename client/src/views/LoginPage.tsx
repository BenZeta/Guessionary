import axios from "axios";
import { useContext, useEffect, useState, FormEvent } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router"; // Import from react-router-dom
import Swal from "sweetalert2";
import { Avatar } from "../helpers/Avatar";
import { themeContext } from "../context/ThemeContext";
import { svg } from "motion/react-client";

export default function LoginPage() {
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  // Correct typing for useContext
  const { currentTheme, setCurrentTheme } = useContext(themeContext);

  useEffect(() => {
    if (localStorage.access_token) {
      Swal.fire({
        title: "You are already logged in",
        text: "Do you want to continue?",
        icon: "warning",
        confirmButtonText: "Continue",
      });
      navigate("/");
    }
  }, [navigate]);

  const handleNextAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % Avatar.length); // Cycle to next avatar
  };

  const handlePrevAvatar = () => {
    setAvatarIndex((prev) => (prev - 1 + Avatar.length) % Avatar.length); // Cycle to previous avatar
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
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
    // Background
    <div className="h-screen flex flex-col">
      {currentTheme === "light" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 absolute top-3 right-3" // Adjusted position here
          onClick={() => setCurrentTheme("dark")}
        >
          <path
            fillRule="evenodd"
            d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 absolute top-3 right-3" // Adjusted position here
          onClick={() => setCurrentTheme("light")}
        >
          <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
        </svg>
      )}

      {/* Header */}
      <div className="flex items-center bg-hidden">
        <a href="/login" className="absolute top-3 left-14">
          <img
            className="h-24 animate-bounceLeft"
            src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299"
            alt="logo"
          />
        </a>
        <h1 className="text-4xl text-white font-bold font-mono absolute top-10 left-36 animate-bounceLeft ">
          Guessionary
        </h1>
      </div>

      {/* Main */}
      <div className="flex flex-col justify-center items-center h-full">
        {/* Navbar */}
        <div className="flex justify-center mt-12 items-center bg-hidden rounded-3xl w-60 h-14 gap-x-20">
          <a href="/">
            <img
              src="https://ik.imagekit.io/3a0xukows/home.png?updatedAt=1736350418372"
              alt="home"
              className="w-10 animate-bounceUp "
            />
            <span className="font-bold text-sm text-white animate-bounceUp">
              Home
            </span>
          </a>
          <a href="/avatars">
            <img
              src="https://ik.imagekit.io/3a0xukows/trading-card%20(4).png?updatedAt=1736350980793"
              alt="avatars"
              className="w-10 animate-bounceUp"
            />
            <span className="font-bold text-sm text-white animate-bounceUp">
              Avatar
            </span>
          </a>
          <button>
            <img
              src="https://ik.imagekit.io/3a0xukows/wave-sound.png?updatedAt=1736351115020"
              alt="sound"
              className="w-10 animate-bounceUp"
            />
            <span className="font-bold text-sm text-white animate-bounceUp">
              Sound
            </span>
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {/* Avatar */}
          <div className="flex items-center justify-center gap-6">
            {/* Prev Avatar */}
            <div className="transition-transform duration-500 transform scale-75 opacity-60 animate-bounceRight">
              <img
                src={Avatar[prevIndex]}
                alt="Previous avatar"
                className="w-56 h-56 rounded-full"
              />
            </div>
            {/* Current Avatar */}
            <div className="mt-8 flex flex-col items-center animate-bounceDown">
              <img
                className="w-56 h-56 rounded-full"
                src={Avatar[avatarIndex]}
                alt="Selected avatar"
              />
            </div>
            {/* Next Avatar */}
            <div className="transition-transform duration-500 transform scale-75 opacity-60 animate-bounceLeft">
              <img
                src={Avatar[nextIndex]}
                alt="Next avatar"
                className="w-56 h-56 rounded-full"
              />
            </div>
          </div>
          {/* Button Avatar */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              type="button"
              className="w-8 h-8 bg-white hover:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 animate-bounceLeft"
              onClick={handlePrevAvatar}
            >
              ‹
            </button>
            <button
              type="button"
              className="w-8 h-8 bg-white hover:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 animate-bounceRight"
              onClick={handleNextAvatar}
            >
              ›
            </button>
          </div>

          {/* Nickname Input and Button */}
          <div className="relative flex justify-center items-center mt-10 animate-bounceUp">
            <div className="relative">
              <input
                type="text"
                placeholder="Nickname"
                className="bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] border-2 border-white text-white font-bold font-mono tex-3xl rounded-3xl w-38 h-14 pl-6 pr-20 "
                id="username"
                autoComplete="current-username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border rounded-3xl w-28 h-10 text-lg font-bold font-mono"
              >
                Start
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
