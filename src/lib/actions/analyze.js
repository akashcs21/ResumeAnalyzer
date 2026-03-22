"use server";

import { z } from "zod";
import { getAnalysisPrompt, requestJsonCompletion } from "@/lib/ai";

const analysisSchema = z.object({
  score: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
  formattingIssues: z.array(z.string()),
  softSkills: z.array(z.string()),
  careerTransitionAdvice: z.string().optional(),
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
 * @param {string} [targetRole] - Optional target role for career transition mode
 * @returns {Promise<{ score: number, missingKeywords: string[], formattingIssues: string[], softSkills: string[], careerTransitionAdvice: string, suggestedBulletPoints: { original: string, improved: string }[] }>}
 */
export async function analyzeResume(resumeText, targetRole = "") {
  try {
    const object = await requestJsonCompletion(
      getAnalysisPrompt(resumeText, targetRole),
      analysisSchema
    );

    return { success: true, data: object };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error: "Failed to analyze resume. Please try again.",
    };
  }
}
