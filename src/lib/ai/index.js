import axios from "axios";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "mistralai/mistral-large-3-675b-instruct-2512";

function getAuthHeaders() {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function extractMessageContent(data) {
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function extractJsonBlock(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || start >= end) {
    throw new Error("Model did not return valid JSON");
  }

  return trimmed.slice(start, end + 1);
}

export async function requestChatCompletion(messages, options = {}) {
  const response = await axios.post(
    NVIDIA_API_URL,
    {
      model: NVIDIA_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.15,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
    },
    {
      headers: getAuthHeaders(),
      timeout: 120000,
    }
  );

  return extractMessageContent(response.data);
}

export async function requestJsonCompletion(prompt, schema) {
  const content = await requestChatCompletion(
    [
      {
        role: "system",
        content:
          "Return only valid JSON. Do not use markdown, commentary, or code fences.",
      },
      { role: "user", content: prompt },
    ],
    {
      temperature: 0.1,
      maxTokens: 2048,
    }
  );

  const parsed = JSON.parse(extractJsonBlock(content));
  return schema.parse(parsed);
}

export function getSystemPrompt(resumeText) {
  return `You are an expert ATS (Applicant Tracking System) analyst and senior career coach with 15+ years of hiring experience.

You have been given the following resume to analyze:

<resume>
${resumeText}
</resume>

Your responsibilities:
1. Evaluate ATS compatibility, including keyword density, parsability, section structure, and formatting.
2. Assess bullet points using the STAR method and flag vague or unquantified claims.
3. Recommend concrete, high-signal resume improvements.
4. Answer follow-up questions strictly in the context of the uploaded resume.
5. Be direct, specific, and actionable.`;
}

export function getAnalysisPrompt(resumeText, jobDescription) {
  const jobContext = jobDescription
    ? `\n\nThe candidate is targeting this job:\n<job_description>\n${jobDescription}\n</job_description>`
    : "";

  return `You are an ATS scoring engine. Analyze the resume below and return ONLY valid JSON.
${jobContext}

<resume>
${resumeText}
</resume>

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "missingKeywords": [<string>, ...],
  "formattingIssues": [<string>, ...],
  "suggestedBulletPoints": [
    { "original": "<original line>", "improved": "<improved version using STAR method>" }
  ]
}

Scoring rubric:
- Keyword optimization: 30 points
- Quantified achievements (STAR method): 25 points
- Formatting and ATS parsability: 20 points
- Section completeness: 15 points
- Overall clarity and impact: 10 points`;
}

export function getBulletFixPrompt(bulletText) {
  return `You are a resume optimization expert. Take the following resume bullet point and create exactly 3 improved variations.

Original bullet point:
"${bulletText}"

Rules for each variation:
1. Use the STAR method.
2. Include specific, quantified metrics.
3. Start with a strong action verb.
4. Keep each under 2 lines.
5. Use industry-standard terminology.

Return ONLY valid JSON:
{
  "variations": [
    "<variation 1>",
    "<variation 2>",
    "<variation 3>"
  ]
}`;
}
