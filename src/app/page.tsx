"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { scanPrice } from "./actions/scan";

export default function Home() {
  const [price, setPrice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webcamRef = useRef<any>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        throw new Error("Failed to capture image");
      }

      const result = await scanPrice(imageSrc);

      if (result.error) {
        setError(result.error);
      } else if (result.price) {
        setPrice(result.price);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Scanning failed");
      console.error("Scanning failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Cart AI Scanner</h1>

      <div className="w-full max-w-md aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          className="w-full h-full object-cover"
          screenshotFormat="image/jpeg"
          mirrored={false}
        />
      </div>

      <button
        onClick={handleScan}
        disabled={isScanning}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold disabled:opacity-50"
      >
        {isScanning ? "Scanning..." : "Scan Price"}
      </button>

      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

      {price && (
        <div className="mt-6 text-xl font-mono">Detected Price: {price}</div>
      )}
    </div>
  );
}
