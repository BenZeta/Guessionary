import { useNavigate } from "react-router";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");

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
