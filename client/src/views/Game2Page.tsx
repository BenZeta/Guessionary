import { useRef, useLayoutEffect, useState } from "react";
import * as fabric from "fabric";
import axios from "axios";
import { baseUrl } from "../constants/baseUrl";
import { useParams } from "react-router";

export default function Game2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const { gameId, roomId } = useParams();

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

  const handleSubmit = async () => {
    if (canvas) {
      const dataUrl: string = canvas.toDataURL();

      await axios.post(
        `${baseUrl}/game/round_2/${roomId}/${gameId}`,
        { dataUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      console.log("Canvas Data URL:", dataUrl);
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
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">Player</h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-1">{/* Tambahkan elemen player di sini */}</div>
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">Create New Room</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 text-center">Game</h2>
            <div
              className="flex-1 bg-white relative"
              ref={containerRef}>
              <canvas ref={canvasRef}></canvas>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Submit
            </button>
            <button
              onClick={handleClear}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
