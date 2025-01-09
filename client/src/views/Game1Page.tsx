import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate, useParams } from "react-router";
import { socket } from "../socket/socket";

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

export default function Game1Page() {
  const [room, setRoom] = useState<Room | null>(null);
  const { roomId, gameId } = useParams();
  const [words, setWords] = useState<string>("");
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

      console.log("room >>>>>>>", data);

      socket.emit("userList", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  async function getContributions() {
    try {
      const { data } = await axios.get(`${baseUrl}/game/word`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      console.log(">>>>>>>>>>>>>>> DATA CONST", data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getContributions();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark the first render as handled
      getUser(); // Call the function only once
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${baseUrl}/game/round_1/${roomId}/${gameId}`,
        { words },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      socket.emit("submitWords", {
        roomId,
        username: localStorage.username,
        words,
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

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
      navigate(`/round_1/${data.roomId}/${data.gameId}`);
    });

    socket.on("leaveRoom:server", (data) => {
      console.log("leaving", data.roomId);
      setRoom(data.updatedRoom);
    });

    socket.on("endRound1:server", (roomId) => {
      console.log("Round 1 ended for room", roomId);

      navigate(`/draw/${roomId}/${gameId}`);
    });

    return () => {
      socket.off("joinRoom");
      socket.off("receiveWords");
      socket.off("userList:server");
      socket.off("startGame:server");
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col animate-bounceLeft">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Player
            </h2>
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
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-9/12 bg-white/10 p-6 relative overflow-hidden">
          {/* Background Animation */}
          <div className="area absolute inset-0 pointer-events-none">
            <ul className="circles">
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>

          <div className="relative z-10 bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col animate-bounceDown">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Game
            </h2>

            {/* Grid Content */}
            <div className="gap-5 rounded-lg w-full h-full overflow-y-auto scrollbar flex-1 p-1">
              <div className="bg-gray-300/50 p-5 h-full rounded-lg">
                <div className="bg-gray-200/10 h-full">
                  <div className="flex flex-col justify-center h-full items-center p-5">
                    <img src="" alt="" />
                    <form
                      className="flex flex-col items-center gap-4"
                      onSubmit={handleSubmit}
                    >
                      <input
                        value={words}
                        onChange={(e) => setWords(e.target.value)}
                        className="w-full rounded-2xl p-2 text-center bg-white-300 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type here..."
                      />
                      <button
                        type="submit"
                        className="bg-teal-500 shadow-[0_5px_0_rgb(0,0,0)] hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all ease-out p-2 hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]"
                      >
                        OK
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
