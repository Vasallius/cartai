"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { scanPrice } from "./actions/scan";

export default function Home() {
  const [price, setPrice] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webcamRef = useRef<any>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  // Initialize barcode reader
  const initBarcodeReader = useCallback(async () => {
    if (!codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
    }
  }, []);

  // Scan for barcodes
  const scanBarcode = async () => {
    if (!webcamRef.current) return null;

    try {
      await initBarcodeReader();
      const videoElement = webcamRef.current.video;
      const result = await codeReader.current?.decodeOnceFromVideoElement(
        videoElement
      );
      return result?.getText() || null;
    } catch (error) {
      console.error("Barcode scan failed:", error);
      return null;
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);

    try {
      // First try to scan barcode
      const barcodeResult = await scanBarcode();
      if (barcodeResult) {
        setBarcode(barcodeResult);
        // Here you could add an API call to look up product details by barcode
        setProduct(`Barcode: ${barcodeResult}`);
      }

      // Then scan for price using GPT Vision
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        throw new Error("Failed to capture image");
      }

      const result = await scanPrice(imageSrc);

      if (result.error) {
        setError(result.error);
      } else {
        setPrice(result.price);
        if (result.product && !barcodeResult) {
          setProduct(result.product);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Scanning failed");
      console.error("Scanning failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Cart AI Scanner</h1>
          <p className="mt-2 text-gray-600">
            Point camera at price tag or barcode
          </p>
        </div>

        <div className="aspect-square relative bg-white rounded-2xl overflow-hidden shadow-lg">
          <Webcam
            ref={webcamRef}
            className="w-full h-full object-cover"
            screenshotFormat="image/jpeg"
            mirrored={false}
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isScanning ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Scanning...
              </span>
            ) : (
              "Scan Item"
            )}
          </button>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {(price || product || barcode) && (
            <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
              {price && (
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {price}
                </div>
              )}
              {product && <div className="text-gray-600">{product}</div>}
              {barcode && !product && (
                <div className="text-sm text-gray-500">Barcode: {barcode}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
