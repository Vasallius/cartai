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
              text: "Please look at this image and extract only the price. Return ONLY the price in the format '$X.XX'. If no clear price is visible, return 'No price found'.",
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
      max_tokens: 50,
    });

    const result = response.choices[0]?.message?.content || "No price found";
    return { price: result };
  } catch (error) {
    console.error("Scan error:", error);
    return {
      price: null,
      error: error instanceof Error ? error.message : "Failed to scan price",
    };
  }
}
