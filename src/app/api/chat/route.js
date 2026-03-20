import { asc, eq } from "drizzle-orm";
import { getSystemPrompt, requestChatCompletion } from "@/lib/ai";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export async function POST(req) {
  try {
    const { chatId, content } = await req.json();

    if (!chatId || !content?.trim()) {
      return Response.json(
        { error: "chatId and content are required" },
        { status: 400 }
      );
    }

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        messages: {
          orderBy: [asc(messages.createdAt)],
        },
      },
    });

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    const userMessage = content.trim();

    await db.insert(messages).values({
      chatId,
      role: "user",
      content: userMessage,
    });

    const conversation = [
      {
        role: "system",
        content: getSystemPrompt(chat.resumeText),
      },
      ...chat.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: userMessage,
      },
    ];

    const reply = await requestChatCompletion(conversation, {
      temperature: 0.2,
      maxTokens: 1200,
    });

    await db.insert(messages).values({
      chatId,
      role: "assistant",
      content: reply,
    });

    return Response.json({ message: reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
