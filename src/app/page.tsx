"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { scanPrice } from "./actions/scan";

type CaptureStep = "price" | "product" | "scanning" | "complete";

export default function Home() {
  const [price, setPrice] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<CaptureStep>("price");
  const [priceImage, setPriceImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webcamRef = useRef<any>(null);

  // Initialize barcode reader

  // Scan for barcodes
  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setError("Failed to capture image");
      return;
    }

    if (step === "price") {
      setPriceImage(imageSrc);
      setStep("product");
    } else if (step === "product") {
      setProductImage(imageSrc);
      setStep("scanning");

      // Process both images
      try {
        // Ensure priceImage exists before proceeding
        if (!priceImage) {
          throw new Error("Price image is missing");
        }

        const result = await scanPrice(priceImage, imageSrc);

        if (result.error) {
          setError(result.error);
        } else {
          // Ensure we're setting valid values
          setPrice(result.price || null);
          setProduct(result.product || null);
        }
        setStep("complete");
      } catch (error) {
        setError(error instanceof Error ? error.message : "Scanning failed");
        console.error("Scanning failed:", error);
        setStep("complete");
      }
    }
  };

  const handleReset = () => {
    setStep("price");
    setPrice(null);
    setProduct(null);
    setError(null);
    setPriceImage(null);
    setProductImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Cart AI Scanner</h1>
          <p className="mt-2 text-gray-600">
            {step === "price" && "First, capture the price tag"}
            {step === "product" && "Now, capture the product"}
            {step === "scanning" && "Processing images..."}
            {step === "complete" && "Scan complete"}
          </p>
        </div>

        {step !== "complete" && (
          <div className="aspect-square relative bg-white rounded-2xl overflow-hidden shadow-lg">
            <Webcam
              ref={webcamRef}
              className="w-full h-full object-cover"
              screenshotFormat="image/jpeg"
              mirrored={false}
            />
          </div>
        )}

        {step === "complete" && (
          <div className="grid grid-cols-2 gap-4">
            {priceImage && (
              <div className="aspect-square relative bg-white rounded-xl overflow-hidden shadow-md">
                <img
                  src={priceImage}
                  alt="Price tag"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                  Price Tag
                </div>
              </div>
            )}
            {productImage && (
              <div className="aspect-square relative bg-white rounded-xl overflow-hidden shadow-md">
                <img
                  src={productImage}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                  Product
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {step !== "complete" && step !== "scanning" && (
            <button
              onClick={handleCapture}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
            >
              {step === "price" ? "Capture Price Tag" : "Capture Product"}
            </button>
          )}

          {step === "scanning" && (
            <div className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold shadow-md flex items-center justify-center">
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
              Processing...
            </div>
          )}

          {step === "complete" && (
            <button
              onClick={handleReset}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
            >
              Scan Another Item
            </button>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {(price || product) && (
            <div className="bg-white p-4 rounded-xl shadow-md space-y-2">
              {price && (
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {price}
                </div>
              )}
              {product && <div className="text-gray-600">{product}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
