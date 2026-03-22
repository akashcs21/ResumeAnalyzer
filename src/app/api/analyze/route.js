import { eq } from "drizzle-orm";
import { analyzeResume } from "@/lib/actions/analyze";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

export async function POST(req) {
  try {
    const { chatId, targetRole } = await req.json();

    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    // Re-analyze if targetRole is passed, or if analysis does not exist yet.
    if (chat.analysis && !targetRole) {
      return Response.json({ ok: true, analysis: chat.analysis });
    }

    const analysisResult = await analyzeResume(chat.resumeText, targetRole);

    if (!analysisResult.success) {
      return Response.json({ error: analysisResult.error }, { status: 500 });
    }

    await db
      .update(chats)
      .set({
        analysis: analysisResult.data,
        analysisCreatedAt: new Date(),
      })
      .where(eq(chats.id, chatId));

    return Response.json({ ok: true, analysis: analysisResult.data });
  } catch (error) {
    console.error("Analyze API error:", error);
    return Response.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
