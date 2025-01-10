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
  users: User[];
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
  gameImage: string;
  createdAt: Date;
  isActive: boolean;
};

export default function LobbyPage() {
  const [loading] = useState(false);
  const [, setRoom] = useState<Room | null>(null);
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

      console.log(data, "getUser");

      setUsers(data.users);

      const user = data.users.find((user: User) => user.id === localStorage.userId);
      setUserRole(user.role || ""); // Set user role
    } catch (error) {
      console.log(error);
    }
  };

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
      console.log(data, "di loby");

      socket.emit("startGame", data);

      setTimeout(() => {
        socket.emit("endRound1", data);
      }, 15000);

      navigate("/round_1/" + roomId + "/" + gameId);
      // navigate("/game1");
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
    if (!socket.connected) {
      socket.auth = {
        token: localStorage.username,
      };
      socket.connect();
    }

    socket.on("roomCreated:server", (newRoom: Room) => {
      console.log("Room has been created");
      console.log(newRoom.users);

      setUsers(newRoom.users);
    });

    socket.on("joinRoom:server", (data) => {
      console.log("User joined room", data.roomId);
      console.log(data.user);

      setUsers((prev) => {
        // Log the previous state for debugging
        console.log("Previous users state:", prev);

        // Return a new array with the previous users and the new user
        return [...prev, data.user];
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

    socket.on("endRound1:server", (data) => {
      console.log("Round 1 ended for room", data.roomId);

      navigate(`/draw/${data.roomId}/${data.gameId}`);
    });

    return () => {
      socket.off("roomCreated:server");
      socket.off("startGame:server");
      socket.off("leaveRoom:server");
      socket.off("endRound1:server");
      socket.off("joinRoom:server");
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-4/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Choose a Game</h2>
              <div className="flex justify-center">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md w-[300px] h-[300px] hover:scale-105 transition-transform duration-300">
                    <div
                      className="absolute inset-0"
                      onClick={() => setGameId(game.id)}>
                      <img
                        src={game.gameImage}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 w-full bg-gray-900/90 text-white p-2">
                      <h3 className="text-sm font-bold text-teal-300 truncate">{game.name}</h3>
                      <p className="text-xs text-gray-400">{game.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center w-full space-x-5">
              <button
                className={`mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all ease-out p-2 
hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)] ${userRole === "Staff" ? "bg-gray-400 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600 text-white"}`}
                onClick={handleStartGame}
                disabled={userRole === "Staff"}>
                Start Game
              </button>
              <button
                onClick={leaveRoom}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all ease-out p-2 
hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]">
                Leave Room
              </button>
            </div>
          </div>
        </div>
        <div className="w-8/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Player</h2>
            <div className="grid grid-cols-4 gap-5 rounded-xl w-full overflow-y-auto scrollbar p-1">
              {loading ? (
                <div className="flex justify-center h-full items-center">
                  <img
                    src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif"
                    alt="loading"
                  />
                </div>
              ) : (
                <>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="w-full h-fit group bg-transparant rounded-full flex flex-col items-center justify-between relative">
                      <div className="relative overflow-hidden w-full rounded-full">
                        <img
                          src={user?.avatar}
                          className="h-full w-full object-cover"
                          alt={user.username}
                        />
                        <div className="absolute h-full w-full bg-black/40 text-white flex items-center justify-center rounded-full -bottom-10 group-hover:bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                          <h2 className="mt-3 text-xl capitalize font-silkscreen text-center">{user.username}</h2>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
