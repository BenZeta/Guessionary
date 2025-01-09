import axios from "axios";
import { useContext, useEffect, useState, FormEvent } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router"; // Import from react-router-dom
import Swal from "sweetalert2";
import { Avatar } from "../helpers/Avatar";
import { themeContext } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";
import WordsLoading from "../components/Loading.tsx";

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  const { isPlaying, toggleAudio } = useSound();

  // Correct typing for useContext
  const { currentTheme, setCurrentTheme } = useContext(themeContext);

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

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const selectedAvatar = Avatar[avatarIndex];
      const { data } = await axios.post(baseUrl + "/login", {
        avatar: selectedAvatar,
        username,
      });

      console.log(">>data login", data);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("avatar", selectedAvatar);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.userId);

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

    <div className="h-screen flex flex-col">
      {currentTheme === "light" ? (
        <img
          className="w-16 absolute top-10 right-20 animate-bounceRight  " // Adjusted position here
          onClick={() => setCurrentTheme("dark")}
          src="https://ik.imagekit.io/3a0xukows/sunflower.png?updatedAt=1736393862092
"
          alt="sunflower"
        />
      ) : (
        <img
          className="w-16 absolute top-10 right-20 animate-bounceRight" // Adjusted position here
          onClick={() => setCurrentTheme("light")}
          src="https://ik.imagekit.io/3a0xukows/full-moon.png?updatedAt=1736393887367"
          alt="mooon"
        />
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
          <a href="/login">
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
          <button onClick={toggleAudio}>
            <img
              src="https://ik.imagekit.io/3a0xukows/wave-sound.png?updatedAt=1736351115020"
              alt="sound"
              className="w-10 animate-bounceUp"
            />
            <span className="font-bold text-sm text-white animate-bounceUp">
              {isPlaying ? "Pause Audio" : "Play Audio"}
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ffff00] rounded-3xl w-28 h-10 text-lg font-bold text-blue"
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
