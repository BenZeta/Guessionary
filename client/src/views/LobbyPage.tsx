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
}

type User = {
  id: string;
  avatar: string;
  username: string;
  role: string; // Add role to the user object
};

type Game = {
  id: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
};

export default function LobbyPage() {
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>(""); // State to hold user role
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

      console.log(">>>>>>> USERS", data.users);

      setRoom(data);
      setUsers(data.users);
      const user = data.users.find((user: User) => user.id === localStorage.userId);
      console.log("User Role:", user.role); // Log to check user role
      setUserRole(user.role || ""); // Set user role
      socket.emit("userList", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  console.log("userRoleeeeeeeeee", userRole);
  console.log("CHECK >>>>>>>>>>", userRole === "Staff");

  const getGames = async () => {
    try {
      const { data } = await axios.get(baseUrl + "/game", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setGames(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartGame = async () => {
    if (userRole === "Staff") {
      console.log("User is Staff, cannot start game."); // Debugging: Check if role is "Staff"
      return;
    }

    try {
      const { data } = await axios.get(baseUrl + `/game/start/${roomId}/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      socket.emit("startGame", { gameId, roomId });

      setTimeout(() => {
        socket.emit("endRound1", `${roomId}`);
      }, 30000);

      navigate(`/round_1/${roomId}/${gameId}`);
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

      Toastify({
        text: data.message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "green",
          color: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "10px 20px",
          fontFamily: "'Roboto', sans-serif",
          fontSize: "14px",
        },
        onClick: function () {},
      }).showToast();

      socket.emit("leaveRoom", { roomId: roomId, updatedRoom: data });

      navigate(`/`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      getUser();
      getGames();
    }
  }, []);

  useEffect(() => {
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
      console.log("Game started:", data);
      navigate(`/round_1/${data.roomId}/${data.gameId}`);
    });

    socket.on("leaveRoom:server", (data) => {
      console.log("leaving", data.roomId);
      setRoom(data.updatedRoom);
    });

    return () => {
      socket.off("userList:server");
      socket.off("startGame:server");
      socket.off("serverLeaveRoom");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-4/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Game List</h2>
            <div className="grid grid-cols-2 gap-4 justify-items-center">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md w-[150px] h-[150px] hover:scale-105 transition-transform duration-300"
                >
                  <div className="absolute inset-0" onClick={() => setGameId(game.id)}>
                    <img
                      src={`https://via.placeholder.com/150x75?text=${game.name}`}
                      alt={game.name}
                      className="w-full h-[75px] object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 w-full bg-gray-900/90 text-white p-2">
                    <h3 className="text-sm font-bold text-teal-300 truncate">{game.name}</h3>
                    <p className="text-xs text-gray-400">{game.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center w-full space-x-5">
              <button
                className={`mt-4 py-2 px-4 font-semibold rounded-md shadow-lg ${
                  userRole === "Staff"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600 text-white"
                }`}
                onClick={handleStartGame}
                disabled={userRole === "Staff"} // Disable button if user role is "Staff"
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

        <div className="w-8/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Your Profile
            </h2>

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
                        <img
                          src={user.avatar}
                          className="absolute inset-0 w-full h-full object-cover rounded-xl z-0"
                          alt=""
                        />

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
