import dedent from "dedent";
import Together from "together-ai";
import { SYSTEM_PROMPTS } from "./prompts";

const options: ConstructorParameters<typeof Together>[0] = {};
if (process.env.HELICONE_API_KEY && process.env.TOGETHER_API_KEY) {
  options.apiKey = process.env.TOGETHER_API_KEY;
  options.baseURL = "https://together.helicone.ai/v1";
  options.defaultHeaders = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Property-appname": "codearena",
  };
}

const together = new Together(options);

async function generatePlan(prompt: string, model: string) {
  const res = await together.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPTS.PLANNING,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    stream: false,
  });
  
  return res.choices[0].message.content;
}

export async function POST(request: Request) {
  const { prompt, model } = await request.json();

  try {
    // First stage: Generate the plan
    const plan = await generatePlan(prompt, model);

    // Second stage: Generate the implementation
    const res = await together.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.IMPLEMENTATION,
        },
        {
          role: "user",
          content: dedent`
          Here is the plan for the component:
          ${plan}

          Based on this plan, implement the component for this prompt:
          ${prompt}

          Please ONLY return code, NO backticks or language names.`,
        },
      ],
      temperature: 0.2,
      stream: true,
      max_tokens: 6000,
    });

    // Add isMultiCall flag to the response headers
    return new Response(res.toReadableStream(), {
      headers: { 
        "Content-Type": "text/event-stream",
        "X-Multi-Call": "true"
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Something went wrong",
      }),
      { status: 500 }
    );
  }
}

export const runtime = "edge";
