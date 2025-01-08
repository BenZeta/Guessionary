import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import Toastify from "toastify-js";

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
  // Add other properties as needed
}

type User = {
  id: string;
  avatar: string;
  username: string;
};

export default function LobbyPage() {
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const isFirstRender = useRef(true);
  const navigate = useNavigate();
  const { roomId } = useParams();

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRoom(data);
      setUsers(data.users);
      console.log(data.users);

      socket.emit("userList", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartGame = async () => {
    try {
      const { data } = await axios.get(baseUrl + `/game/start/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      socket.emit("startGame", data);

      // navigate("/game1");
    } catch (error) {
      console.log(error);
    }
  };

  const leaveRoom = async () => {
    try {
      // Step 1: Send request to backend to leave the room
      const { data } = await axios.patch(
        `${baseUrl}/leave-room`,
        { targetedRoomId: roomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

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

      // Step 2: Emit the "leaveRoom" event to the server (optional)
      socket.emit("leaveRoom", { roomId: roomId, updatedRoom: data });

      // Optionally navigate after the user has left the room
      navigate(`/`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      getUser();
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

    socket.on("startGame:server", (data) => {
      console.log(data);
    });

    socket.on("leaveRoom:server", (data) => {
      console.log("leaving", data.roomId);
      setRoom(data.updatedRoom);
    });

    return () => {
      socket.off("userList:server");
      socket.off("startGame:server");
      socket.off("serverLeaveRoom");
      socket.disconnect(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}

        <div className="w-4/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Room List</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar"></div>

            {/* Create Room Button */}
            <div className="flex justify-center w-full space-x-5">
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
                onClick={handleStartGame}
              >
                Start Game
              </button>

              <button
                onClick={leaveRoom}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
              >
                Leave Room
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
                  <img src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif" alt="" />
                </div>
              ) : (
                <>
                  {users.map((user) => {
                    return (
                      <div
                        key={user.id}
                        className="bg-gray-300/15 border border-black/20 rounded-xl min-h-[300px] min-w-[300px] flex items-center justify-center relative"
                      >
                        {/* Image placed in the background */}

                        <img
                          src={user.avatar}
                          className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
                          alt=""
                        />

                        {/* Name div overlay */}
                        <div className="absolute bottom-0 w-full bg-black/90 text-white p-5 rounded-b-xl text-center z-10">
                          {user.username}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
