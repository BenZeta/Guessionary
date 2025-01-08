import React, { useRef, useLayoutEffect, useState } from "react";
import * as fabric from "fabric";

export default function Canvas() {
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

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  );
}
