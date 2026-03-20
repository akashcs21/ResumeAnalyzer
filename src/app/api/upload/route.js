import { eq } from "drizzle-orm";
import { analyzeResume } from "@/lib/actions/analyze";
import { db } from "@/lib/db";
import { chats, users } from "@/lib/db/schema";
import { parsePDF } from "@/lib/pdf";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

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
    const { text: resumeText } = await parsePDF(buffer);

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

    const analysisResult = await analyzeResume(resumeText);

    if (!analysisResult.success) {
      return new Response(
        JSON.stringify({ error: analysisResult.error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new chat with the resume text
    const [newChat] = await db
      .insert(chats)
      .values({
        userId,
        title: file.name.replace(".pdf", ""),
        resumeText,
        analysis: analysisResult.data,
        analysisCreatedAt: new Date(),
      })
      .returning();

    return new Response(
      JSON.stringify({
        chatId: newChat.id,
        resumeText,
        title: newChat.title,
        analysis: analysisResult.data,
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
