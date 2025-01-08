import React, { useRef, useLayoutEffect, useState } from "react";
import * as fabric from "fabric";

export default function Game2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<any>(null);

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;
    const containerElement = containerRef.current;

    if (!canvasElement || !containerElement) return;

    // Set canvas size dynamically
    const width = containerElement.offsetWidth;
    const height = containerElement.offsetHeight;

    const canvas = new fabric.Canvas(canvasElement, {
      height,
      width,
      isDrawingMode: true,
      backgroundColor: "#ffffff",
      selection: false,
    });

    setCanvas(canvas);

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "#000000";
    canvas.freeDrawingBrush.width = 5;

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, []);

  async function handleSubmit() {
    const data = await canvas.toDataURL();
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold">Round</h1>
      </div>

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
            </div>

            {/* Create Room Button */}
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Create New Room
            </button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-9/12 bg-white/10 p-6">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Game</h2>

            {/* Grid Content */}
            <div className="flex-1 w-full h-full relative bg-white">
              <div ref={containerRef} style={{ width: "100%", height: "95%" }}>
                <canvas ref={canvasRef}></canvas>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
            >
              submit
            </button>
            <button
              onClick={() => canvas.clear()}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
            >
              clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
