"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { openai, getAnalysisPrompt } from "@/lib/ai";

// Zod schema to enforce the exact JSON structure from the LLM
const analysisSchema = z.object({
  score: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
  formattingIssues: z.array(z.string()),
  suggestedBulletPoints: z.array(
    z.object({
      original: z.string(),
      improved: z.string(),
    })
  ),
});

/**
 * Analyze a resume and return a structured ATS score with feedback.
 * @param {string} resumeText - The raw text from the resume PDF
 * @param {string} [jobDescription] - Optional job description to compare against
 * @returns {Promise<{ score: number, missingKeywords: string[], formattingIssues: string[], suggestedBulletPoints: { original: string, improved: string }[] }>}
 */
export async function analyzeResume(resumeText, jobDescription = "") {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: analysisSchema,
      prompt: getAnalysisPrompt(resumeText, jobDescription),
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error: "Failed to analyze resume. Please try again.",
    };
  }
}
