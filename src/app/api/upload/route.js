import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, users } from "@/lib/db/schema";
import { parsePDF } from "@/lib/pdf";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

function redactPersonalData(text) {
  if (!text) return "";
  
  // Redact email addresses
  let redacted = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  
  // Redact phone numbers (looks for 10-15 digits separated by common delimiters)
  redacted = redacted.replace(/(\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g, (match) => {
    const digitCount = (match.match(/\d/g) || []).length;
    if (digitCount >= 10 && digitCount <= 15) {
      return "[REDACTED_PHONE]";
    }
    return match;
  });

  return redacted;
}

function isLikelyResume(text) {
  if (!text) return false;
  
  // Rule 1: A massive book or manual has tens/hundreds of thousands of characters. 
  // A typical 2-page resume has ~3,000-5,000 characters.
  // By capping at 12,000 characters (approx 4 dense pages), we instantly reject books.
  if (text.length > 12000) return false;
  
  // Rule 2: Too short? (e.g., an image-only PDF with no text layer, or just a few words)
  if (text.length < 150) return false;
  
  const lowerText = text.toLowerCase();
  const resumeIndicators = [
    "experience", "education", "skills", "work history", "employment",
    "projects", "university", "college", "degree", "bachelor", "master",
    "professional summary", "technologies", "certifications", "profile"
  ];
  
  let matchCount = 0;
  for (const keyword of resumeIndicators) {
    if (lowerText.includes(keyword)) {
      matchCount++;
    }
  }
  
  // Require at least 4 strong resume keywords
  return matchCount >= 4;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const incomingUserId = formData.get("userId");
    const userId =
      typeof incomingUserId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        incomingUserId
      )
        ? incomingUserId
        : DEFAULT_USER_ID;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert file to buffer and extract text
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text: rawText } = await parsePDF(buffer);
    
    if (!isLikelyResume(rawText)) {
      return new Response(
        JSON.stringify({ error: "The uploaded document does not appear to be a resume. Please upload a valid resume PDF." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const resumeText = redactPersonalData(rawText);

    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from PDF" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      await db.insert(users).values({
        id: userId,
        email: `demo+${userId}@resume-analyzer.local`,
      });
    }

    // Create a new chat with the resume text
    const [newChat] = await db
      .insert(chats)
      .values({
        userId,
        title: file.name.replace(".pdf", ""),
        resumeText,
      })
      .returning();

    return new Response(
      JSON.stringify({
        chatId: newChat.id,
        resumeText,
        title: newChat.title,
        analysisPending: true,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process upload" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
