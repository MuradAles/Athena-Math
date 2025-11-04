/**
 * Firebase Cloud Functions for AI Math Tutor
 * Handles OpenAI API calls with SSE streaming
 */

import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions/v2";
import OpenAI from "openai";
import {SOCRATIC_TUTOR_PROMPT} from "./utils/prompts";

// Initialize OpenAI client lazily (when function is called)
// This ensures environment variables are loaded
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is missing. " +
      "Please set it in functions/.env file"
    );
  }
  return new OpenAI({
    apiKey,
  });
}

/**
 * Get system prompt with optional problem context
 */
function getSystemPrompt(problem?: string, problemContext?: string): string {
  let prompt = SOCRATIC_TUTOR_PROMPT;
  
  if (problem) {
    prompt += `\n\nStudent's problem: ${problem}`;
  }
  
  if (problemContext) {
    prompt += `\n\nContext: ${problemContext}`;
  }
  
  return prompt;
}

/**
 * HTTP Cloud Function for chat completion with SSE streaming
 * 
 * POST /chat
 * Body: { messages: Array<{role: string, content: string}>, problem?: string }
 * 
 * Returns: Server-Sent Events stream of OpenAI response
 */
export const chat = onRequest(
  {
    cors: true, // Allow all origins for development
    timeoutSeconds: 300,
    maxInstances: 10,
  },
  async (req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const {messages, problem, problemContext} = req.body;

      // Validate request body
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).send("Invalid request: messages array required");
        return;
      }

      // Build conversation messages for OpenAI
      // Support both text and image content (OpenAI vision format)
      const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: getSystemPrompt(problem, problemContext),
        },
        // Only send last 8 messages for cost optimization
        ...messages.slice(-8).map((msg: {role: string; content: string | Array<any>}) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content, // Can be string or array (for images)
        })),
      ];

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Get OpenAI client (initialized when function is called)
      const openai = getOpenAIClient();
      
      // Check if any message has image content (for vision support)
      const hasImages = conversationMessages.some(
        (msg) => Array.isArray(msg.content) && msg.content.some((item: any) => item.type === 'image_url')
      );
      
      // Use gpt-4o for vision support (images), fallback to gpt-4o-mini for text-only
      const model = hasImages ? "gpt-4o" : "gpt-4o-mini";
      
      logger.info(`Creating OpenAI stream with model: ${model}`);
      logger.info(`Sending ${conversationMessages.length} messages to OpenAI`);
      
      // Create OpenAI stream
      const stream = await openai.chat.completions.create({
        model,
        messages: conversationMessages,
        stream: true,
        temperature: 0.8, // Natural, varied responses
        frequency_penalty: 0.5, // Reduces repetition
        presence_penalty: 0.3, // Encourages variety
        // No max_tokens limit for flexible explanations
      });

      logger.info("OpenAI stream created, starting to read chunks...");

      // Stream response as SSE events
      let chunkCount = 0;
      for await (const chunk of stream) {
        chunkCount++;
        const delta = chunk.choices[0]?.delta?.content;

        if (delta) {
          // Send SSE format: data: {content}\n\n
          res.write(`data: ${JSON.stringify({content: delta})}\n\n`);
        }
      }

      logger.info(`Stream completed. Processed ${chunkCount} chunks.`);

      // Send completion event
      res.write(`data: ${JSON.stringify({done: true})}\n\n`);
      res.end();

      logger.info("Chat stream completed successfully");
    } catch (error) {
      logger.error("Error in chat function:", error);

      // Send error as SSE event
      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";

      res.write(`data: ${JSON.stringify({error: errorMessage})}\n\n`);
      res.end();
    }
  }
);

/**
 * HTTP Cloud Function for extracting math problems from images
 * 
 * POST /extract-problem
 * Body: { imageUrl: string }
 * 
 * Returns: { problem: string } - Extracted problem text
 */
export const extractProblem = onRequest(
  {
    cors: true, // Automatically handles CORS
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).end();
      return;
    }

    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { imageUrl } = req.body;

      // Validate request body
      if (!imageUrl || typeof imageUrl !== "string") {
        res.status(400).send("Invalid request: imageUrl required");
        return;
      }

      // Get OpenAI client
      const openai = getOpenAIClient();

      // Use GPT-4 Vision to extract problem from image
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use vision-capable model
        messages: [
          {
            role: "system",
            content: "You are a math problem extractor. Extract the mathematical problem from the image. Return ONLY the problem text, nothing else. If there are multiple problems, extract the main one. Preserve mathematical notation exactly as shown.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: "Extract the math problem from this image. Return only the problem statement, preserving all mathematical notation.",
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const extractedProblem = response.choices[0]?.message?.content?.trim() || "";

      if (!extractedProblem) {
        res.status(400).send("Could not extract problem from image");
        return;
      }

      // Return extracted problem
      res.json({ problem: extractedProblem });
      logger.info("Problem extracted successfully");
    } catch (error) {
      logger.error("Error in extractProblem function:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";

      res.status(500).json({ error: errorMessage });
    }
  }
);

