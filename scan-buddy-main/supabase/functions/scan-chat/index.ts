import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, scanAnalysis, imageBase64, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a medical imaging AI assistant. You ONLY answer questions related to the uploaded medical scan and its analysis results.

Current scan analysis context:
${JSON.stringify(scanAnalysis, null, 2)}

STRICT RULES:
1. ONLY answer questions about the uploaded medical scan, its analysis, medical conditions shown, and related medical information.
2. If the user asks ANYTHING not related to the scan (general knowledge, coding, personal questions, etc.), respond EXACTLY with: "I can only answer questions related to the uploaded medical scan."
3. Keep responses concise, informative, and medically relevant.
4. Always remind users this is for educational purposes only.
5. Reference specific findings from the analysis when relevant.`;

    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add image context to first message if available
    if (imageBase64 && mimeType) {
      aiMessages.push({
        role: "user",
        content: [
          { type: "text", text: "This is the medical scan image for reference." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      });
      aiMessages.push({ role: "assistant", content: "I can see the medical scan. I'm ready to answer questions about it based on the analysis results." });
    }

    // Add conversation history
    for (const msg of messages) {
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("scan-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
