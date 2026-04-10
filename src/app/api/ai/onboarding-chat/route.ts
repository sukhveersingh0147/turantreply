import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/auth";
import { getOnboardingSystemPrompt } from "@/lib/onboarding-prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { messages, businessType } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages array" }), { status: 400 });
    }

    const systemPrompt = getOnboardingSystemPrompt(businessType || "general");

    const stream = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: (m.role === "ai" || m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
          content: m.content || m.text || ""
        }))
      ],
      temperature: 0.8,
      max_tokens: 300, // Per user request Fix 5
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          console.error("[STREAMING_ERROR]", streamError);
          controller.error(streamError);
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });

  } catch (error: any) {
    console.error("[GROQ-ONBOARDING] ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}

