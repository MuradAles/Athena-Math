/**
 * Firebase Cloud Functions for AI Math Tutor
 * Handles OpenAI API calls with SSE streaming
 */

import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions/v2";
import OpenAI from "openai";
import {SOCRATIC_TUTOR_PROMPT} from "./utils/prompts";
import {MATH_TOOL_SCHEMAS} from "./utils/mathToolSchemas";
import * as mathTools from "./utils/mathTools";

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
 * Execute math tool function based on function name and arguments
 */
async function executeMathTool(
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  try {
    logger.info(`Executing math tool: ${functionName} with args: ${JSON.stringify(args)}`);
    
    switch (functionName) {
      // Algebra tools
      case "solve_linear_equation":
        return mathTools.solveLinearEquation(args.equation, args.variable);
      case "solve_quadratic_equation":
        return mathTools.solveQuadraticEquation(args.equation, args.variable);
      case "factor_expression":
        return mathTools.factorExpression(args.expression);
      case "expand_expression":
        return mathTools.expandExpression(args.expression);
      case "simplify_expression":
        return mathTools.simplifyExpression(args.expression);
      case "solve_system_of_equations":
        return mathTools.solveSystemOfEquations(args.equations, args.variables);
      
      // Geometry tools
      case "calculate_area":
        return mathTools.calculateArea(args.shape, args.dimensions);
      case "calculate_volume":
        return mathTools.calculateVolume(args.shape, args.dimensions);
      case "calculate_perimeter":
        return mathTools.calculatePerimeter(args.shape, args.dimensions);
      case "calculate_surface_area":
        return mathTools.calculateSurfaceArea(args.shape, args.dimensions);
      case "solve_pythagorean_theorem":
        return mathTools.solvePythagoreanTheorem(args);
      
      // Calculus tools
      case "calculate_derivative":
        return mathTools.calculateDerivative(args.expression, args.variable);
      case "calculate_integral":
        return mathTools.calculateIntegral(
          args.expression,
          args.variable,
          args.lower,
          args.upper
        );
      case "calculate_limit":
        return mathTools.calculateLimit(args.expression, args.variable, args.approaches);
      
      // Arithmetic tools
      case "evaluate_expression":
        return mathTools.evaluateExpression(args.expression);
      case "calculate_percentage":
        return mathTools.calculatePercentage(args);
      
      // Validation tools
      case "validate_answer":
        return mathTools.validateAnswer(args.problem, args.student_answer, args.problem_type);
      case "check_step":
        return mathTools.checkStep(args.previous_step, args.current_step, args.operation);
      
      default:
        throw new Error(`Unknown math tool: ${functionName}`);
    }
  } catch (error) {
    logger.error(`Error executing math tool ${functionName}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
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
      
      // Create OpenAI stream with tools
      const stream = await openai.chat.completions.create({
        model,
        messages: conversationMessages,
        tools: MATH_TOOL_SCHEMAS,
        stream: true,
        temperature: 0.8, // Natural, varied responses
        frequency_penalty: 0.5, // Reduces repetition
        presence_penalty: 0.3, // Encourages variety
        // No max_tokens limit for flexible explanations
      });

      logger.info("OpenAI stream created, starting to read chunks...");

      // Stream response as SSE events
      let chunkCount = 0;
      let functionCallName = "";
      let functionCallArgs = "";
      let accumulatedContent = "";
      let finishReason = "";
      let toolCallId = "";

      for await (const chunk of stream) {
        chunkCount++;
        const choice = chunk.choices[0];
        
        // Check finish reason
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
        
        // Handle function calls
        if (choice?.delta?.tool_calls) {
          const toolCall = choice.delta.tool_calls?.[0];
          if (toolCall) {
            if (toolCall.id) {
              toolCallId = toolCall.id;
            }
            if (toolCall.function?.name) {
              functionCallName = toolCall.function.name;
            }
            if (toolCall.function?.arguments) {
              functionCallArgs += toolCall.function.arguments;
            }
          }
        }
        
        // Handle content
        const delta = choice?.delta?.content;
        if (delta) {
          accumulatedContent += delta;
          // Send SSE format: data: {content}\n\n
          res.write(`data: ${JSON.stringify({content: delta})}\n\n`);
        }
      }

      logger.info(`Stream completed. Processed ${chunkCount} chunks. Finish reason: ${finishReason}`);

      // Handle function calls if detected
      if (finishReason === "tool_calls" && functionCallName && functionCallArgs) {
        try {
          logger.info(`Function call detected: ${functionCallName} with args: ${functionCallArgs}`);
          
          // Parse function arguments
          const args = JSON.parse(functionCallArgs);
          
          // Execute function
          const functionResult = await executeMathTool(functionCallName, args);
          
          // Use actual tool call ID or generate one
          const actualToolCallId = toolCallId || `call_${Date.now()}`;
          
          // Add function result to conversation
          conversationMessages.push({
            role: "assistant",
            content: accumulatedContent || null,
            tool_calls: [{
              id: actualToolCallId,
              type: "function",
              function: {
                name: functionCallName,
                arguments: functionCallArgs,
              },
            }],
          } as any);
          
          conversationMessages.push({
            role: "tool",
            tool_call_id: actualToolCallId,
            content: JSON.stringify(functionResult),
          } as any);
          
          // Continue streaming with function result
          logger.info("Continuing stream with function result...");
          
          const continueStream = await openai.chat.completions.create({
            model,
            messages: conversationMessages,
            tools: MATH_TOOL_SCHEMAS,
            stream: true,
            temperature: 0.8,
            frequency_penalty: 0.5,
            presence_penalty: 0.3,
          });
          
          // Stream the continued response
          for await (const chunk of continueStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({content: delta})}\n\n`);
            }
            
            // Check for additional function calls (recursive handling)
            if (chunk.choices[0]?.delta?.tool_calls) {
              // For simplicity, we'll handle one level of function calls
              // Multiple nested calls would need more complex handling
            }
          }
        } catch (error) {
          logger.error(`Error handling function call: ${error}`);
          res.write(`data: ${JSON.stringify({error: `Function call error: ${error}`})}\n\n`);
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

/**
 * HTTP Cloud Function for transcribing audio to text using Whisper-1
 * 
 * POST /transcribe
 * Body: FormData with audio file (multipart/form-data)
 * 
 * Returns: { text: string } - Transcribed text
 */
export const transcribe = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    // Set CORS headers FIRST before any response
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
      // Get OpenAI client
      const openai = getOpenAIClient();

      // For Cloud Functions, the audio file should be sent as base64 string
      // or we need to handle multipart/form-data
      const { audioData } = req.body;

      if (!audioData) {
        res.status(400).json({ error: "Invalid request: audioData required" });
        return;
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');

      logger.info("Transcribing audio with Whisper-1...");

      // Create a File object from buffer for OpenAI SDK
      // Node.js 22+ has native File support
      // OpenAI SDK accepts File, Blob, or Buffer
      const audioFile = new File([audioBuffer], 'audio.webm', {
        type: 'audio/webm',
      });

      // Transcribe audio using Whisper-1
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "json",
      });

      const text = transcription.text.trim();

      if (!text) {
        res.status(400).json({ error: "Could not transcribe audio" });
        return;
      }

      logger.info("Audio transcribed successfully");

      // Return transcribed text
      res.json({ text });
    } catch (error) {
      logger.error("Error in transcribe function:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";

      res.status(500).json({ error: errorMessage });
    }
  }
);

/**
 * HTTP Cloud Function for text-to-speech using TTS-1
 * 
 * POST /speech
 * Body: { text: string, voice?: string }
 * 
 * Returns: Audio file (base64 encoded MP3)
 */
export const speech = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    // Set CORS headers FIRST before any response
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
      const { text, voice = "alloy" } = req.body;

      // Validate request body
      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "Invalid request: text required" });
        return;
      }

      // Validate voice
      const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
      if (!validVoices.includes(voice)) {
        res.status(400).json({ error: `Invalid voice. Must be one of: ${validVoices.join(", ")}` });
        return;
      }

      // Get OpenAI client
      const openai = getOpenAIClient();

      logger.info(`Generating speech with TTS-1, voice: ${voice}...`);

      // Generate speech using TTS-1
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
        input: text,
        response_format: "mp3",
      });

      // Convert response to buffer
      const buffer = Buffer.from(await speechResponse.arrayBuffer());

      // Convert to base64 for JSON response
      const base64Audio = buffer.toString('base64');

      logger.info("Speech generated successfully");

      // Return audio as base64 string
      res.json({ audio: base64Audio, format: "mp3" });
    } catch (error) {
      logger.error("Error in speech function:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";

      res.status(500).json({ error: errorMessage });
    }
  }
);

