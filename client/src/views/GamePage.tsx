import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate, useParams } from "react-router";
import { socket } from "../socket/socket";
import Toastify from "toastify-js";

type User = {
  id: string;
  username: string;
  avatar: string;
};

type Room = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  users: User[];
};

export default function GamePage() {
  const [room, setRoom] = useState<Room | null>(null);
  const { roomId } = useParams();
  const isFirstRender = useRef(true);
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

  const leaveRoom = async () => {
    try {
      const { data } = await axios.patch(
        `${baseUrl}/leave-room`,
        { targetedRoomId: roomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      console.log(data.message);

      Toastify({
        text: data.message,
        duration: 3000,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "green",
          color: "#ffffff", // Teks putih
          borderRadius: "8px", // Membuat sudut lebih bulat
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Memberikan bayangan
          padding: "10px 20px", // Menambah ruang dalam
          fontFamily: "'Roboto', sans-serif", // Sesuaikan dengan font umum
          fontSize: "14px",
        },
        onClick: function () {}, // Callback setelah klik
      }).showToast();

      socket.emit("leaveRoom", `${roomId}`);

      navigate(`/`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark the first render as handled
      getUser(); // Call the function only once
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    socket.on("userList:server", (newUsers) => {
      setRoom((prev) => {
        if (!prev) return prev;
        const updatedUsers = [...newUsers];

        return {
          ...prev,
          users: updatedUsers,
        };
      });
    });

    return () => {
      socket.off("userList:server");
      socket.disconnect(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold">Round</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col animate-bounceLeft">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Player</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              {room?.users.map((user, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3 "
                >
                  <img src={user?.avatar} className="w-20 h-20 rounded-full" />
                  <div className="ml-3 text-2xl">{user?.username}</div>
                </div>
              ))}
            </div>

            <button
              onClick={leaveRoom}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col animate-bounceDown">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Game</h2>

            {/* Grid Content */}
            <div className="gap-5 rounded-lg w-full h-full overflow-y-auto scrollbar flex-1 p-1">
              <div className="bg-gray-300/50 p-5 h-full rounded-lg">
                <div className="bg-gray-200/10 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
