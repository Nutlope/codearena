// app/api/answer/route.ts
import dedent from "dedent";
import Together from "together-ai";

const together = new Together();

export async function POST(request: Request) {
  const { prompt, model } = await request.json();

  console.log(`Creating "${prompt}" with ${model}`);

  try {
    const res = await together.chat.completions.create({
      // model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      model,
      messages: [
        {
          role: "system",
          content: dedent`
          You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

          - Think carefully step by step.
          - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
          - Make sure the React app is interactive and functional by creating state when needed and having no required props
          - If you use any imports from React like useState or useEffect, make sure to import them directly
          - Use TypeScript as the language for the React component
          - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
          - NEVER import any CSS files like ./App.css
          - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
          - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
          - Do not import any libraries or dependencies other than React
          - NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
        `,
        },
        {
          role: "user",
          content: dedent`
          ${prompt}
          
          Please ONLY return code, NO backticks or language names.`,
        },
      ],
      temperature: 0.2,
      stream: true,
    });

    return new Response(res.toReadableStream());
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    } else {
      return new Response("Unknown error", { status: 500 });
    }
  }
}
