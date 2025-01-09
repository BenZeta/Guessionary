import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket";

export default function Game3Page() {
  const [drawingFromR2, setDrawingFromR2] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };
    socket.connect();

    socket.on("endRound2:server", (data) => {
      console.log("Received data from server:", data);
      setDrawingFromR2(data.user64);
    });

    return () => {
      socket.off("endRound2:server");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (drawingFromR2 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = drawingFromR2;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    }
  }, [drawingFromR2]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold">Round 3: Guess the Drawing</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">Players</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3">
                <img src="https://stickershop.line-scdn.net/stickershop/v1/product/11365/LINEStorePC/main.png?v=19" alt="Avatar" className="w-20 h-20 rounded-full" />
                <div className="ml-3 text-2xl truncate">Player 1</div>
              </div>
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3">
                <img src="https://i.pinimg.com/736x/bc/d2/26/bcd226a70d45275c44ac2822ec0c00aa.jpg" alt="Avatar" className="w-20 h-20 rounded-full" />
                <div className="ml-3 text-2xl truncate">Player 2</div>
              </div>
            </div>
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">Create New Room</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-teal-300 mb-4">Game</h2>
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
              <canvas
                ref={canvasRef}
                width="800"
                height="400"
                className="w-full h-96 bg-white rounded-lg"
              />
              {drawingFromR2 ? null : (
                <p className="text-white">Waiting for the drawing...</p>
              )}
              <input
                type="text"
                placeholder="Guess the word..."
                className="w-2/3 p-2 rounded-lg text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
                Submit Guess
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
