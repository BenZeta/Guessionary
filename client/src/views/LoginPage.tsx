import axios from "axios";
import { useState } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router";
import { Avatar } from "../helpers/avatar";

export default function LoginPage() {
  const [avatar, setAvatar] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(baseUrl + "/login", {
        avatar,
        username,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("avatar", data.avatar);
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
        <a href="/login">
          <img
            className="h-20"
            src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299"
            alt="logo"
          />
        </a>
        <h1 className="text-3xl text-white font-bold font-sans">Guessionary</h1>
      </div>
      <button className="bg-white border rounded-3xl w-28 h-10 absolute top-4 right-4">
        Theme
      </button>
      {/* Main */}
      <div className="flex flex-col justify-center items-center h-full">
        {/* Navbar */}
        <div className="flex justify-center items-center bg-white border rounded-3xl w-96 h-14">
          NAVBAR
        </div>
        {/* Avatar */}
        <div className="mt-8">
          <img
            className="w-40"
            src="https://ik.imagekit.io/3a0xukows/NFT-1.png?updatedAt=1736308208591"
            alt="avatar"
          />
        </div>
        {/* Nickname Input and Button */}
        <div className="relative flex items-center mt-4">
          <input
            type="text"
            placeholder="Nickname"
            className="bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] border-2 border-white rounded-3xl w-80 h-12 pr-20"
          />
          <button className="absolute right-2 bg-[#ffff00] border rounded-3xl w-16 h-8 text-sm">
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
