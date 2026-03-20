"use server";

import { z } from "zod";
import { getBulletFixPrompt, requestJsonCompletion } from "@/lib/ai";

const bulletFixSchema = z.object({
  variations: z.array(z.string()).length(3),
});

/**
 * Generate 3 quantified STAR-method variations for a resume bullet point.
 * @param {string} bulletText - The original bullet point text
 * @returns {Promise<{ success: boolean, data?: { variations: string[] }, error?: string }>}
 */
export async function fixBulletPoint(bulletText) {
  try {
    const object = await requestJsonCompletion(
      getBulletFixPrompt(bulletText),
      bulletFixSchema
    );

    return { success: true, data: object };
  } catch (error) {
    console.error("Bullet fix error:", error);
    return {
      success: false,
      error: "Failed to generate variations. Please try again.",
    };
  }
}
