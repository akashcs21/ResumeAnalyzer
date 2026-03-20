import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { openai, getSystemPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export async function POST(req) {
  const { messages: incomingMessages, chatId } = await req.json();

  // Fetch the chat to get resumeText for context
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });

  if (!chat) {
    return new Response(JSON.stringify({ error: "Chat not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Save the user's message to the database
  const lastUserMessage = incomingMessages[incomingMessages.length - 1];
  if (lastUserMessage?.role === "user") {
    await db.insert(messages).values({
      chatId,
      role: "user",
      content: lastUserMessage.content,
    });
  }

  // Stream the AI response
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: getSystemPrompt(chat.resumeText),
    messages: incomingMessages,
    onFinish: async ({ text }) => {
      // Save the assistant's response to the database
      await db.insert(messages).values({
        chatId,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toDataStreamResponse();
}
