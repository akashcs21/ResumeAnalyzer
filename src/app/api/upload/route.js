import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { parsePDF } from "@/lib/pdf";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: "File and userId are required" }),
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
