import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { socket } from "../socket/socket";

export default function Game3Page() {
  const { roomId, gameId } = useParams();
  const [drawingFromR2, setDrawingFromR2] = useState<string>("");

  useEffect(() => {
    // Configure socket with auth token
    socket.auth = {
      token: localStorage.username,
    };

    // Connect to the socket server
    socket.connect();

    // Handle server event
    socket.on("endRound2:server", (data) => {
      console.log("Received data from server:", data);
      setDrawingFromR2(data.user64); // Assuming `data.drawing` contains the relevant drawing information
    });

    // Clean up socket event listeners on component unmount
    return () => {
      socket.off("endRound2:server");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Player</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3">
                <img
                  src="https://stickershop.line-scdn.net/stickershop/v1/product/11365/LINEStorePC/main.png?v=19"
                  alt="Avatar"
                  className="w-20 h-20 rounded-full"
                />
                <div className="ml-3 text-2xl truncate">Haloooooooooooooooooo</div>
              </div>
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3">
                <img
                  src="https://i.pinimg.com/736x/bc/d2/26/bcd226a70d45275c44ac2822ec0c00aa.jpg"
                  alt="Avatar"
                  className="w-20 h-20 rounded-full"
                />
                <div className="ml-3 text-2xl truncate">Haiiiiiiiiiii</div>
              </div>
              {/* Add more rooms dynamically if needed */}
            </div>

            {/* Create Room Button */}
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Create New Room
            </button>
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
                    {/* Label */}
                    <label className="text-black font-semibold">Guess Here</label>
                    {/* Input */}
                    <input
                      className="w-full rounded-2xl p-2 text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type here..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-white text-center">
                    Real-Time Drawing Data: {drawingFromR2 || "No data yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
