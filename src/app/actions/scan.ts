"use server";

import { ScanResult } from "@/types/api";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scanPrice(
  priceImage: string,
  productImage: string
): Promise<ScanResult> {
  try {
    if (!priceImage || !productImage) {
      throw new Error("Missing images");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "I will show you two images. The first is of a price tag, and the second is of the product itself. Please provide:\n1. The price from the first image\n2. A brief description of the product from the second image\n\nRespond in this exact format:\nPRICE: [the price or 'No price found']\nPRODUCT: [product description or 'No product identified']",
            },
            {
              type: "image_url",
              image_url: {
                url: priceImage,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: productImage,
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
