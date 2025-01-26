"use server";

import { ScanResult } from "@/types/api";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scanPrice(base64Image: string): Promise<ScanResult> {
  try {
    if (!base64Image) {
      throw new Error("No image provided");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and provide two pieces of information:
              1. The price: Extract any visible price, including currency symbol if shown. Format should be natural (e.g., £4.99, €10.50, 1200¥).
              2. Product identification: If you can see a barcode or product details, briefly describe what the product is.
              
              Respond in this exact format:
              PRICE: [the price or "No price found"]
              PRODUCT: [product description or "No product identified"]`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 150,
    });

    const result = response.choices[0]?.message?.content || "";

    // Parse the response
    const priceMatch = result.match(/PRICE: (.*)/);
    const productMatch = result.match(/PRODUCT: (.*)/);

    return {
      price: priceMatch ? priceMatch[1].trim() : null,
      product: productMatch ? productMatch[1].trim() : null,
    };
  } catch (error) {
    console.error("Scan error:", error);
    return {
      price: null,
      product: null,
      error: error instanceof Error ? error.message : "Failed to scan",
    };
  }
}
