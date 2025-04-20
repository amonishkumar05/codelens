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


function generateHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; 
  }

  return hash.toString();
}


const analysisCache = new Map<string, AnalyzeCodeResponse>();

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error(
    "Google API Key not found. Please set VITE_GOOGLE_API_KEY in your .env file."
  );
}

const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

const model = google("gemini-2.5-pro-exp-03-25", {
  structuredOutputs: true,
});

export async function analyzeCode(code: string): Promise<AnalyzeCodeResponse> {
  
  const cacheKey = generateHash(code);

  
  if (analysisCache.has(cacheKey)) {
    console.log("Using cached analysis result");
    return analysisCache.get(cacheKey)!;
  }

  try {
    const prompt = `
You are a senior developer reviewing code. Analyze this code carefully and provide specific feedback:
1. Identify potential bugs, logic errors, and edge cases
2. Suggest performance optimizations
3. Point out security concerns
4. Recommend best practices and design pattern improvements
5. Do not lose track of the line number, do not mess up the line number

Format your response as a JSON object with an array of issues:
{
  "issues": [
    {
      "line": <starting line number>,
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
            endLine: z.number().optional(),
            message: z.string(),
            severity: z.enum(["error", "warning", "info"]),
          })
        ),
      }),
    });

    const result = object as AnalyzeCodeResponse;

    
    analysisCache.set(cacheKey, result);

    return result;
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
