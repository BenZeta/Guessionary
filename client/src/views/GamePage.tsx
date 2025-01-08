import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket";
import Swal from "sweetalert2";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useNavigate } from "react-router";

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
  // Add other properties as needed
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState([])
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRoom(data);

      socket.emit("userList", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}

        <div className="w-4/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Room List
            </h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar"></div>

            {/* Create Room Button */}
            <div className="flex justify-center w-full space-x-5">
              <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
                Create New Room
              </button>
              <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-8/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Your Profile
            </h2>

            {/* Grid Content */}
            <div className="grid grid-cols-3 gap-5 rounded-lg w-full overflow-y-auto scrollbar p-1">
              {loading ? (
                <div className="flex justify-center h-full items-center">
                  <img
                    src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif"
                    alt=""
                  />
                </div>
              ) : (
                
                <div className="bg-gray-300/15 border border-black/20 rounded-xl min-h-[300px] min-w-[300px] flex items-center justify-center relative">
                  {/* Image placed in the background */}
                  
                  <img
                    src="https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-playful-kitten-kitty-cute-cat-smile-png-image_10263743.png"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
                    alt=""
                  />

                  {/* Name div overlay */}
                  <div className="absolute bottom-0 w-full bg-black/90 text-white p-5 rounded-b-xl text-center z-10">
                    Name
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
