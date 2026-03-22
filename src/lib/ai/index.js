import OpenAI from "openai";

const NVIDIA_MODEL = "nvidia/nemotron-3-super-120b-a12b";

function getClient() {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
}

function extractTextContent(content) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part?.type === "text") {
          return part.text || "";
        }

        return "";
      })
      .join("")
      .trim();
  }

  return "";
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

function getChatOptions(options = {}) {
  return {
    model: NVIDIA_MODEL,
    temperature: options.temperature ?? 1,
    top_p: options.topP ?? 0.95,
    max_tokens: options.maxTokens ?? 16384,
    reasoning_budget: options.reasoningBudget ?? 16384,
    chat_template_kwargs: {
      enable_thinking: options.enableThinking ?? true,
    },
  };
}

export async function requestChatCompletion(messages, options = {}) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    ...getChatOptions(options),
    messages,
    stream: false,
  });

  return extractTextContent(completion.choices?.[0]?.message?.content);
}

export async function createChatCompletionStream(messages, options = {}) {
  const client = getClient();

  return client.chat.completions.create({
    ...getChatOptions(options),
    messages,
    stream: true,
  });
}

export async function requestJsonCompletion(prompt, schema) {
  const content = await requestChatCompletion(
    [
      {
        role: "system",
        content:
          "Return only valid JSON. Do not use markdown, commentary, code fences, or explanations.",
      },
      { role: "user", content: prompt },
    ],
    {
      temperature: 0.2,
      topP: 0.7,
      maxTokens: 4096,
      reasoningBudget: 0,
      enableThinking: false,
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
5. EXTREMELY IMPORTANT: Keep your responses incredibly concise. Use bullet points where possible and never exceed 3-4 short paragraphs. Cut the fluff.`;
}

export function getInterviewPrompt(resumeText) {
  return `You are a tough but fair technical interviewer. You have just been handed this candidate's resume:

<resume>
${resumeText}
</resume>

Your responsibilities:
1. Act exclusively as the interviewer. Cross-examine the candidate on specific claims made in their resume.
2. Ask one concise, challenging follow-up question at a time.
3. If they claim to have 'reduced latency by 50%', ask exactly HOW they measured and achieved that.
4. Keep your responses under 3 sentences. Cut the fluff. Do not break character.`;
}

export function getAnalysisPrompt(resumeText, targetRole) {
  const jobContext = targetRole
    ? `\n\nThe candidate is targeting this new role: <target_role>\n${targetRole}\n</target_role>. Provide actionable advice on how to transition their past experience into this new domain.`
    : "";

  return `You are an ATS scoring engine and career transition coach. Analyze the resume below and return ONLY valid JSON.
${jobContext}

<resume>
${resumeText}
</resume>

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "missingKeywords": [<string>, ...],
  "formattingIssues": [<string>, ...],
  "softSkills": ["extract 3-5 high-level semantic soft skills inferred from their achievements", ...],
  "careerTransitionAdvice": "<if target_role is provided, suggest how to frame existing experience; else omit or leave empty string>",
  "suggestedBulletPoints": [
    { "original": "<original line>", "improved": "<improved version using STAR method (XYZ format)>" }
  ]
}

Scoring rubric:
- Keyword optimization: 30 points
- Quantified achievements (STAR method): 25 points
- Formatting and ATS parsability: 20 points
- Section completeness: 15 points
- Overall clarity and impact: 10 points

Important: For formatting issues, analyze the text structure. For softSkills, do NOT just list words they wrote; read between the lines (e.g., 'reduced load time' -> 'Performance Optimization', 'led team of 5' -> 'Leadership').`;
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

export function getRoastPrompt(resumeText) {
  return `You are a brutally honest, highly critical, yet ultimately helpful tech recruiter. Your job is to ROAST the candidate's resume. 

<resume>
${resumeText}
</resume>

Your responsibilities:
1. Be playfully harsh and sarcastic. Tear apart cliché corporate jargon (like 'results-driven team player').
2. Point out obvious padding, weak power verbs, or lack of metrics.
3. Keep it funny but provide actual actionable advice disguised as insults.
4. Use emojis like 🔥, 💀, 🤡 where appropriate to emphasize your roast.
5. EXTREMELY IMPORTANT: Keep your roast painfully short and punchy. Never exceed 3-4 sentences total. Get straight to the burn.`;
}
