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
      const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: getSystemPrompt(problem, problemContext),
        },
        // Only send last 8 messages for cost optimization
        ...messages.slice(-8).map((msg: {role: string; content: string}) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Get OpenAI client (initialized when function is called)
      const openai = getOpenAIClient();
      
      // Create OpenAI stream
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-effective model
        messages: conversationMessages,
        stream: true,
        temperature: 0.8, // Natural, varied responses
        frequency_penalty: 0.5, // Reduces repetition
        presence_penalty: 0.3, // Encourages variety
        // No max_tokens limit for flexible explanations
      });

      // Stream response as SSE events
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;

        if (delta) {
          // Send SSE format: data: {content}\n\n
          res.write(`data: ${JSON.stringify({content: delta})}\n\n`);
        }
      }

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

