import { asc, eq } from "drizzle-orm";
import { createChatCompletionStream, getSystemPrompt, getInterviewPrompt, getRoastPrompt } from "@/lib/ai";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

export async function POST(req) {
  try {
    const { chatId, content, isInterviewMode, isRoastMode } = await req.json();

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
        content: isRoastMode 
          ? getRoastPrompt(chat.resumeText)
          : isInterviewMode 
            ? getInterviewPrompt(chat.resumeText)
            : getSystemPrompt(chat.resumeText),
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

    const completion = await createChatCompletionStream(conversation, {
      temperature: 1,
      topP: 0.95,
      maxTokens: 16384,
      reasoningBudget: 16384,
      enableThinking: true,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            if (!chunk.choices?.length) {
              continue;
            }

            const delta = chunk.choices[0].delta;
            const contentPart = delta?.content || "";

            if (contentPart) {
              fullResponse += contentPart;
              controller.enqueue(encoder.encode(contentPart));
            }
          }

          if (fullResponse.trim()) {
            await db.insert(messages).values({
              chatId,
              role: "assistant",
              content: fullResponse,
            });
          }

          controller.close();
        } catch (streamError) {
          console.error("Chat stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
