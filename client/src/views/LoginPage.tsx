import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Avatar } from "../helpers/Avatar";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.access_token) {
      Swal.fire({
        title: "you already logged in",
        text: "Do you want to continue",
        icon: "error",
        confirmButtonText: "yes",
      });
      navigate("/");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(baseUrl + "/login", {
        // avatar,
        username,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
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
          <div className="mt-8 flex flex-col items-center">
            <img
              className="w-40"
              src="https://ik.imagekit.io/3a0xukows/NFT-1.png?updatedAt=1736308208591"
              alt="avatar"
            />
            <div className="flex justify-center items-center gap-4 mt-2">
              <button className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
                ‹
              </button>
              <button className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
                ›
              </button>
            </div>
          </div>
          {/* Nickname Input and Button */}
          <div className="relative flex items-center mt-4">
            <input
              type="text"
              placeholder="Nickname"
              className="bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] border-2 border-white rounded-3xl w-80 h-12 pr-20"
              id="username"
              autoComplete="current-username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="absolute right-2 bg-[#ffff00] border rounded-3xl w-16 h-8 text-sm">
              Start
            </button>
          </div>
        </form>
      </div>
      <div>
        <form onSubmit={handleLogin}>
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username..."
          />
        </form>
      </div>
    </div>
  );
}
