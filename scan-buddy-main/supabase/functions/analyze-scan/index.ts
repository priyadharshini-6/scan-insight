import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert medical imaging AI assistant. You analyze medical scan images (X-ray, MRI, CT scan, Ultrasound) and provide detailed analysis.

IMPORTANT: You MUST respond in valid JSON format only. No markdown, no code blocks, just pure JSON.

Analyze the provided medical scan image and return a JSON object with this exact structure:
{
  "scanType": "X-ray" | "MRI" | "CT Scan" | "Ultrasound" | "Unknown",
  "scanTypeConfidence": <number 0-100>,
  "overallResult": "Normal" | "Abnormal",
  "overallConfidence": <number 0-100>,
  "conditions": [
    {
      "name": "<condition name>",
      "confidence": <number 0-100>,
      "description": "<brief description>"
    }
  ],
  "regions": [
    {
      "label": "<region name>",
      "x": <percentage 0-100 from left edge of image>,
      "y": <percentage 0-100 from top edge of image>,
      "width": <percentage 0-100 of image width>,
      "height": <percentage 0-100 of image height>,
      "severity": "low" | "medium" | "high",
      "description": "<what is observed in this specific region>"
    }
  ],
  "explanation": {
    "summary": "<2-3 sentence summary>",
    "details": ["<detail point 1>", "<detail point 2>", ...],
    "reasoning": "<why this result was determined>"
  },
  "detailedFindings": [
    {
      "area": "<anatomical area>",
      "observation": "<what is seen>",
      "significance": "<clinical significance>",
      "severity": "normal" | "mild" | "moderate" | "severe"
    }
  ],
  "measurements": {
    "notes": ["<any size/measurement observations>"]
  },
  "riskLevel": "Low" | "Medium" | "High",
  "qualityAssessment": {
    "quality": "Good" | "Acceptable" | "Poor",
    "issues": ["<issue if any>"]
  },
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}

CRITICAL INSTRUCTIONS FOR REGION COORDINATES:
- Think of the image as a 100x100 grid. x=0,y=0 is the top-left corner.
- "x" is the LEFT edge of the bounding box as a percentage of image width.
- "y" is the TOP edge of the bounding box as a percentage of image height.
- "width" and "height" are the size of the box as percentages.
- Be VERY precise. Carefully examine WHERE in the image the abnormality is located.
- For example, if a fracture is in the middle-right of the image, x might be ~55, y might be ~40.
- Bounding boxes should tightly wrap the affected area, not be overly large.
- Each region MUST correspond to an actual visible finding in the image.
- If no abnormalities are visible, return an empty regions array.

Be thorough but realistic. If the image doesn't appear to be a medical scan, still provide your best analysis. Always include at least one condition assessment. Provide detailed "detailedFindings" for the Details tab with specific anatomical observations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this medical scan image thoroughly. Detect the scan type, identify any abnormalities, and provide a complete analysis." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response, handling potential markdown wrapping
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      analysisResult = {
        scanType: "Unknown",
        scanTypeConfidence: 50,
        overallResult: "Abnormal",
        overallConfidence: 50,
        conditions: [{ name: "Unable to parse", confidence: 0, description: "AI response could not be parsed" }],
        regions: [],
        explanation: { summary: content, details: [], reasoning: "Raw AI response" },
        riskLevel: "Medium",
        qualityAssessment: { quality: "Acceptable", issues: [] },
        recommendations: ["Please retry the analysis"],
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
