import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router";
import { socket } from "../socket/socket";
import axios from "axios";
import { baseUrl } from "../constants/baseUrl";
import { useParams } from "react-router";

type User = {
  id: string;
  avatar: string;
  username: string;
};

export default function Game3Page() {
  // const { roomId, gameId } = useParams();
  const [drawingFromR2, setDrawingFromR2] = useState<string>("");
  const { roomId, gameId } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const isFirstRender = useRef(true);
  const [guesses, setGuesses] = useState<string>("");

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${baseUrl}/game/guess/${roomId}/${gameId}`,
        { guesses },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );
      console.log(data, "handlesubmit round 3");

      socket.emit("guessRound3", { roomId, guesser: localStorage.username, guess: guesses });
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
    // Handle server event
    if (!socket.connected) {
      socket.auth = {
        token: localStorage.username,
      };
      socket.connect();
    }

    socket.on("receiveUser64", (user64) => {
      console.log("Received data from server:", user64);
      setDrawingFromR2(user64); // Assuming `data.drawing` contains the relevant drawing information
    });

    socket.on("guessResult:server", (data: { guesser: string; isCorrect: boolean; submitter: string }) => {
      console.log("Guess result:", data);
    });

    // Clean up socket event listeners on component unmount
    return () => {
      socket.off("guessResult:server");
      // socket.off("endRound2:server");
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: User List */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">Player</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              {users.map((user: User, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3 ">
                  <img
                    src={user?.avatar}
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="ml-3 text-2xl">{user?.username}</div>
                </div>
              ))}
            </div>
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">Create New Room</button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-9/12 bg-white/10 p-6 flex justify-center items-center">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full w-full flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-teal-300 mb-4">Game</h2>
            {/* Grid Content */}
            <div className="gap-5 rounded-lg w-full h-full flex-1 p-1">
              <div className="bg-gray-300/50 p-5 h-full rounded-lg">
                <div className="bg-gray-200/10 h-full flex justify-center items-end p-5">
                  <div className="flex flex-col items-center w-2/5 gap-2">
                    <img
                      src={`${drawingFromR2}` || undefined}
                      alt=""
                    />
                    {/* Label */}
                    <form onSubmit={handleSubmit}>
                      <label className="text-black font-semibold">Guess Here</label>
                      {/* Input */}
                      <input
                        onChange={(e) => setGuesses(e.target.value)}
                        className="w-full rounded-2xl p-2 text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type here..."
                      />
                    </form>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-white text-center">Real-Time Drawing Data: {drawingFromR2 || "No data yet"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
