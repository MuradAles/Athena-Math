"use strict";
/**
 * Firebase Cloud Functions for AI Math Tutor
 * Handles OpenAI API calls with SSE streaming
 */
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractProblem = exports.chat = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./utils/prompts");
// Initialize OpenAI client lazily (when function is called)
// This ensures environment variables are loaded
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is missing. " +
            "Please set it in functions/.env file");
    }
    return new openai_1.default({
        apiKey,
    });
}
/**
 * Get system prompt with optional problem context
 */
function getSystemPrompt(problem, problemContext) {
    let prompt = prompts_1.SOCRATIC_TUTOR_PROMPT;
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
exports.chat = (0, https_1.onRequest)({
    cors: true, // Allow all origins for development
    timeoutSeconds: 300,
    maxInstances: 10,
}, async (req, res) => {
    var _a, e_1, _b, _c;
    var _d, _e;
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
        const { messages, problem, problemContext } = req.body;
        // Validate request body
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            res.status(400).send("Invalid request: messages array required");
            return;
        }
        // Build conversation messages for OpenAI
        const conversationMessages = [
            {
                role: "system",
                content: getSystemPrompt(problem, problemContext),
            },
            // Only send last 8 messages for cost optimization
            ...messages.slice(-8).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];
        // Set SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        // Get OpenAI client (initialized when function is called)
        const openai = getOpenAIClient();
        v2_1.logger.info("Creating OpenAI stream with model: gpt-4o-mini");
        v2_1.logger.info(`Sending ${conversationMessages.length} messages to OpenAI`);
        // Create OpenAI stream
        // Note: Using gpt-4o-mini which doesn't require organization verification for streaming
        // Alternative: gpt-4o requires organization verification (https://platform.openai.com/settings/organization/general)
        const stream = await openai.chat.completions.create({
            model: "gpt-4o", // gpt-4o-mini doesn't require org verification for streaming
            messages: conversationMessages,
            stream: true,
            temperature: 0.8, // Natural, varied responses
            frequency_penalty: 0.5, // Reduces repetition
            presence_penalty: 0.3, // Encourages variety
            // No max_tokens limit for flexible explanations
        });
        v2_1.logger.info("OpenAI stream created, starting to read chunks...");
        // Stream response as SSE events
        let chunkCount = 0;
        try {
            for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
                _c = stream_1_1.value;
                _f = false;
                const chunk = _c;
                chunkCount++;
                const delta = (_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content;
                if (delta) {
                    // Send SSE format: data: {content}\n\n
                    res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = stream_1.return)) await _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        v2_1.logger.info(`Stream completed. Processed ${chunkCount} chunks.`);
        // Send completion event
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        v2_1.logger.info("Chat stream completed successfully");
    }
    catch (error) {
        v2_1.logger.error("Error in chat function:", error);
        // Send error as SSE event
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.end();
    }
});
/**
 * HTTP Cloud Function for extracting math problems from images
 *
 * POST /extract-problem
 * Body: { imageUrl: string }
 *
 * Returns: { problem: string } - Extracted problem text
 */
exports.extractProblem = (0, https_1.onRequest)({
    cors: true, // Automatically handles CORS
    timeoutSeconds: 60,
    maxInstances: 10,
}, async (req, res) => {
    var _a, _b, _c;
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
        const extractedProblem = ((_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || "";
        if (!extractedProblem) {
            res.status(400).send("Could not extract problem from image");
            return;
        }
        // Return extracted problem
        res.json({ problem: extractedProblem });
        v2_1.logger.info("Problem extracted successfully");
    }
    catch (error) {
        v2_1.logger.error("Error in extractProblem function:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
});
//# sourceMappingURL=index.js.map