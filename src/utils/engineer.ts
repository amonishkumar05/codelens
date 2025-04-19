import { generateObject } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

interface AnalyzeCodeResponse {
  issues: {
    line: number;
    message: string;
    severity: "error" | "warning" | "info";
  }[];
  summary?: string;
}
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error(
    "Google API Key not found. Please set VITE_GOOGLE_API_KEY in your .env file."
  );
}

const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

const model = google("gemini-2.5-flash-preview-04-17", {
  structuredOutputs: true,
});

export async function analyzeCode(code: string): Promise<AnalyzeCodeResponse> {
  try {
    const prompt = `
You are a senior developer reviewing code. Analyze this code carefully and provide specific feedback:
1. Identify potential bugs, logic errors, and edge cases
2. Suggest performance optimizations
3. Point out security concerns
4. Recommend best practices and design pattern improvements

Format your response as a JSON object with an array of issues:
{
  "issues": [
    {
      "line": <line number>,
      "message": "<your feedback>",
      "severity": "<error|warning|info>"
    },
    ...
  ]
}
`;
    const { object } = await generateObject({
      system: prompt,
      model,
      prompt: `
      Here is the code to review:
      \`\`\`
      ${code}
      \`\`\`
      Please provide your feedback in the specified format.`,
      schema: z.object({
        issues: z.array(
          z.object({
            line: z.number(),
            message: z.string(),
            severity: z.enum(["error", "warning", "info"]),
          })
        ),
      }),
    });

    return object as AnalyzeCodeResponse;
  } catch (error) {
    console.error("Error analyzing code:", error);
    return {
      issues: [
        {
          line: 1,
          message:
            "An error occurred while analyzing the code. Please try again.",
          severity: "error",
        },
      ],
    };
  }
}
