import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return Response.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json({ error: error?.message || "Transcription failed" }, { status: 500 });
  }
}
