// filepath: /Users/Ben/Desktop/Hacktiv8/P2/Guessionary/client/src/views/Game2Page.tsx
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import * as fabric from "fabric";
import axios from "axios";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate, useParams } from "react-router";
import { socket } from "../socket/socket";

type User = {
  id: string;
  avatar: string;
  username: string;
};

export default function Game2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [wordsFromR1, setWordsFromR1] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [dataDrawing, setDataDrawing] = useState<string>("");
  const [timer, setTimer] = useState<number>(60); // Timer for 15 seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const { gameId, roomId } = useParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;
    const containerElement = containerRef.current;

    if (!canvasElement || !containerElement) return;

    // Ambil dimensi container
    const width = containerElement.offsetWidth;
    const height = containerElement.offsetHeight;

    // Inisialisasi canvas Fabric.js
    const fabricCanvas = new fabric.Canvas(canvasElement, {
      height,
      width,
      isDrawingMode: true,
      backgroundColor: "#ffffff",
      selection: false,
    });

    // Set brush default
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = "#000000";
    fabricCanvas.freeDrawingBrush.width = 5;

    // Simpan canvas ke state
    setCanvas(fabricCanvas);

    // Cleanup pada unmount
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on component unmount or when timer stops
    } else if (timer === 0) {
      setIsTimerRunning(false); // Stop the timer when it reaches 0
      console.log("Time's up!");
    }
  }, [isTimerRunning, timer]);

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setUsers(data.users);
      const user = data.users.find(
        (user: User) => user.id === localStorage.userId
      );
      console.log("User Role:", user.role); // Log to check user role
      socket.emit("userList", data?.users);
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

  const handleSubmit = async () => {
    if (canvas) {
      const dataUrl: string = canvas.toDataURL();
      setDataDrawing(dataUrl);

      await axios.post(
        `${baseUrl}/game/round_2/${roomId}/${gameId}`,
        { user64: dataUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      socket.emit("submitDataRound2", { roomId, gameId, user64: dataUrl });

      console.log("Canvas Data URL:", JSON.stringify(dataUrl));
    } else {
      console.error("Canvas belum siap!");
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
    } else {
      console.error("Canvas belum siap!");
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = {
        token: localStorage.username,
      };
      socket.connect();
    }

    socket.on("receiveWords", (words) => {
      console.log("Received words:", words?.words[0]);
      // console.log(words);

      setWordsFromR1(words?.words); // Simpan kata di state atau variabel
    });

    socket.on("userList:server", (newUsers) => {
      setUsers(newUsers);
    });

    setTimeout(() => {
      socket.emit("endRound2", { roomId, gameId, user64: dataDrawing });
    }, 15000);

    socket.on("endRound2:server", (data) => {
      console.log("Ended Round 2:", data);

      navigate(`/round_3/${data.roomId}/${data.gameId}`);
    });

    return () => {
      socket.off("receiveWords");
      socket.off("endRound2:server");
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
        {/* Left Panel */}
        <div className="w-3/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">
              Player
            </h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              {users.map((user: User, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3 "
                >
                  <img src={user?.avatar} className="w-20 h-20 rounded-full" />
                  <div className="ml-3 text-2xl">{user?.username}</div>
                </div>
              ))}
            </div>
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Create New Room
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-silkscreen font-bold text-teal-300 mb-4 text-center">
              Game
            </h2>
            {isTimerRunning ? (
              <div className="text-xl font-bold text-white mb-5">
                Time remaining: {timer} seconds
              </div>
            ) : null}
            {/* Toolbar */}
            <div className="flex gap-4 mb-4 items-center">
              {COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                    selectedColor === color
                      ? "border-white"
                      : "border-transparent"
                  }`}
                ></div>
              ))}
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="cursor-pointer"
              />
              <button
                onClick={handleEraser}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Eraser
              </button>

              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 bg-white relative" ref={containerRef}>
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">Game</h2>
            <h3>{wordsFromR1}</h3>
            <div
              className="flex-1 bg-white relative"
              ref={containerRef}>
              <canvas ref={canvasRef}></canvas>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}>
              <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">Submit</button>
            </form>
            <button
              type="submit"
              className="bg-teal-500 font-silkscreen shadow-[0_5px_0_rgb(0,0,0)] hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md  transition-all ease-out p-2 hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
