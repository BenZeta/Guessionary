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

const COLORS = [
  "#ffffff", // White
  "#000000", // Black
  "#808080", // Gray
  "#ff0000", // Red
  "#ffff00", // Yellow
  "#0000ff", // Blue
  "#008000", // Green
  "#00ffff", // Cyan
  "#ffa500", // Orange
  "#ffc0cb", // Pink
  "#800080", // Purple
  "#a52a2a", // Brown
  "#008080", // Teal
  "#ff00ff", // Magenta
  "#ffbf00", // Amber
];

export default function Game2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [wordsFromR1, setWordsFromR1] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(5);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;
    const containerElement = containerRef.current;

    if (!canvasElement || !containerElement) return;

    const width = containerElement.offsetWidth;
    const height = containerElement.offsetHeight;

    const fabricCanvas = new fabric.Canvas(canvasElement, {
      height,
      width,
      isDrawingMode: true,
      backgroundColor: "#ffffff",
      selection: false,
    });

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = selectedColor;
    fabricCanvas.freeDrawingBrush.width = brushSize;

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = selectedColor;
    }
  }, [selectedColor]);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
    } else {
      console.error("Canvas belum siap!");
    }
  };

  const handleEraser = () => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = "#ffffff"; // Match canvas background color
    }
  };

  const handleAddRectangle = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        width: 100,
        height: 50,
        fill: selectedColor,
        left: 100,
        top: 100,
      });
      canvas.add(rect);
    }
  };

  const handleAddCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        radius: 50,
        fill: selectedColor,
        left: 150,
        top: 150,
      });
      canvas.add(circle);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold font-silkscreen">Round</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-3/12 bg-white/10 p-6">{/* Player List */}</div>

        {/* Right Panel */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-silkscreen font-bold text-teal-300 mb-4 text-center">
              Game
            </h2>

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
                onClick={handleAddRectangle}
                className="bg-teal-500 text-white px-4 py-2 rounded-md"
              >
                Rectangle
              </button>
              <button
                onClick={handleAddCircle}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Circle
              </button>
              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 bg-white relative" ref={containerRef}>
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>
          <button
            type="submit"
            className="bg-teal-500 font-silkscreen shadow-[0_5px_0_rgb(0,0,0)] hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md  transition-all ease-out p-2 hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
