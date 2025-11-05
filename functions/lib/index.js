"use strict";
/**
 * Firebase Cloud Functions for AI Math Tutor
 * Handles OpenAI API calls with SSE streaming
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.speech = exports.extractTopic = exports.transcribe = exports.extractProblem = exports.chat = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./utils/prompts");
const mathToolSchemas_1 = require("./utils/mathToolSchemas");
const mathTools = __importStar(require("./utils/mathTools"));
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
 * Execute math tool function based on function name and arguments
 */
async function executeMathTool(functionName, args) {
    try {
        v2_1.logger.info(`Executing math tool: ${functionName} with args: ${JSON.stringify(args)}`);
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
                return mathTools.calculateIntegral(args.expression, args.variable, args.lower, args.upper);
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
    }
    catch (error) {
        v2_1.logger.error(`Error executing math tool ${functionName}:`, error);
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
exports.chat = (0, https_1.onRequest)({
    cors: true, // Allow all origins for development
    timeoutSeconds: 300,
    maxInstances: 10,
}, async (req, res) => {
    var _a, e_1, _b, _c, _d, e_2, _e, _f;
    var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
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
        // Support both text and image content (OpenAI vision format)
        const conversationMessages = [
            {
                role: "system",
                content: (0, prompts_1.getSystemPrompt)(problem, problemContext),
            },
            // Only send last 8 messages for cost optimization
            ...messages.slice(-8).map((msg) => ({
                role: msg.role,
                content: msg.content, // Can be string or array (for images)
            })),
        ];
        // Set SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        // Get OpenAI client (initialized when function is called)
        const openai = getOpenAIClient();
        // Always use GPT-4o for better accuracy and mathematical reasoning
        // GPT-4o provides superior math accuracy compared to GPT-4o-mini
        const model = "gpt-4o";
        v2_1.logger.info(`Creating OpenAI stream with model: ${model} (GPT-4o for improved accuracy)`);
        v2_1.logger.info(`Sending ${conversationMessages.length} messages to OpenAI`);
        // Create OpenAI stream with tools
        const stream = await openai.chat.completions.create({
            model,
            messages: conversationMessages,
            tools: mathToolSchemas_1.MATH_TOOL_SCHEMAS,
            stream: true,
            temperature: 0.8, // Natural, varied responses
            frequency_penalty: 0.5, // Reduces repetition
            presence_penalty: 0.3, // Encourages variety
            // No max_tokens limit for flexible explanations
        });
        v2_1.logger.info("OpenAI stream created, starting to read chunks...");
        // Stream response as SSE events
        let chunkCount = 0;
        let functionCallName = "";
        let functionCallArgs = "";
        let accumulatedContent = "";
        let finishReason = "";
        let toolCallId = "";
        try {
            for (var _s = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _s = true) {
                _c = stream_1_1.value;
                _s = false;
                const chunk = _c;
                chunkCount++;
                const choice = chunk.choices[0];
                // Check finish reason
                if (choice === null || choice === void 0 ? void 0 : choice.finish_reason) {
                    finishReason = choice.finish_reason;
                }
                // Handle function calls
                if ((_g = choice === null || choice === void 0 ? void 0 : choice.delta) === null || _g === void 0 ? void 0 : _g.tool_calls) {
                    const toolCall = (_h = choice.delta.tool_calls) === null || _h === void 0 ? void 0 : _h[0];
                    if (toolCall) {
                        if (toolCall.id) {
                            toolCallId = toolCall.id;
                        }
                        if ((_j = toolCall.function) === null || _j === void 0 ? void 0 : _j.name) {
                            functionCallName = toolCall.function.name;
                        }
                        if ((_k = toolCall.function) === null || _k === void 0 ? void 0 : _k.arguments) {
                            functionCallArgs += toolCall.function.arguments;
                        }
                    }
                }
                // Handle content
                const delta = (_l = choice === null || choice === void 0 ? void 0 : choice.delta) === null || _l === void 0 ? void 0 : _l.content;
                if (delta) {
                    accumulatedContent += delta;
                    // Send SSE format: data: {content}\n\n
                    res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_s && !_a && (_b = stream_1.return)) await _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        v2_1.logger.info(`Stream completed. Processed ${chunkCount} chunks. Finish reason: ${finishReason}`);
        // Handle function calls if detected
        // IMPORTANT: Tool calls happen during streaming, so we need to send tool results
        // as they occur, not just at the end. But for now, we handle them at the end.
        if (finishReason === "tool_calls" && functionCallName && functionCallArgs) {
            try {
                v2_1.logger.info(`Function call detected: ${functionCallName} with args: ${functionCallArgs}`);
                // Clean function arguments - remove any trailing whitespace or invalid characters
                let cleanedArgs = functionCallArgs.trim();
                // Try to find valid JSON in the string (in case there's extra text)
                // Look for the first complete JSON object
                let jsonStart = cleanedArgs.indexOf('{');
                let jsonEnd = cleanedArgs.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    cleanedArgs = cleanedArgs.substring(jsonStart, jsonEnd + 1);
                }
                // Additional cleaning: remove any trailing commas or invalid characters
                // Try to find the last valid closing brace
                let braceCount = 0;
                let validEnd = -1;
                for (let i = 0; i < cleanedArgs.length; i++) {
                    if (cleanedArgs[i] === '{')
                        braceCount++;
                    if (cleanedArgs[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            validEnd = i;
                            break;
                        }
                    }
                }
                if (validEnd !== -1) {
                    cleanedArgs = cleanedArgs.substring(0, validEnd + 1);
                }
                v2_1.logger.info(`Cleaned function args (length ${cleanedArgs.length}): ${cleanedArgs.substring(0, 200)}...`);
                // Try to parse - if it fails, log the exact string for debugging
                let args;
                try {
                    args = JSON.parse(cleanedArgs);
                }
                catch (parseError) {
                    v2_1.logger.error(`JSON parse error. Raw string: ${functionCallArgs}`);
                    v2_1.logger.error(`Cleaned string: ${cleanedArgs}`);
                    v2_1.logger.error(`Parse error: ${parseError}`);
                    throw parseError;
                }
                // Execute function
                const functionResult = await executeMathTool(functionCallName, args);
                // Send tool call result to client for progress tracking
                // This allows client to detect correctness from tool results, not text parsing
                res.write(`data: ${JSON.stringify({
                    tool_call: {
                        name: functionCallName,
                        args: args,
                        result: functionResult,
                    }
                })}\n\n`);
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
                });
                conversationMessages.push({
                    role: "tool",
                    tool_call_id: actualToolCallId,
                    content: JSON.stringify(functionResult),
                });
                // Continue streaming with function result
                v2_1.logger.info("Continuing stream with function result...");
                const continueStream = await openai.chat.completions.create({
                    model,
                    messages: conversationMessages,
                    tools: mathToolSchemas_1.MATH_TOOL_SCHEMAS,
                    stream: true,
                    temperature: 0.8,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.3,
                });
                // Stream the continued response
                let continueFinishReason = "";
                let continueFunctionCallName = "";
                let continueFunctionCallArgs = "";
                try {
                    for (var _t = true, continueStream_1 = __asyncValues(continueStream), continueStream_1_1; continueStream_1_1 = await continueStream_1.next(), _d = continueStream_1_1.done, !_d; _t = true) {
                        _f = continueStream_1_1.value;
                        _t = false;
                        const chunk = _f;
                        const choice = chunk.choices[0];
                        // Check finish reason
                        if (choice === null || choice === void 0 ? void 0 : choice.finish_reason) {
                            continueFinishReason = choice.finish_reason;
                        }
                        // Handle function calls in continue stream
                        if ((_m = choice === null || choice === void 0 ? void 0 : choice.delta) === null || _m === void 0 ? void 0 : _m.tool_calls) {
                            const toolCall = (_o = choice.delta.tool_calls) === null || _o === void 0 ? void 0 : _o[0];
                            if (toolCall) {
                                if ((_p = toolCall.function) === null || _p === void 0 ? void 0 : _p.name) {
                                    continueFunctionCallName = toolCall.function.name;
                                }
                                if ((_q = toolCall.function) === null || _q === void 0 ? void 0 : _q.arguments) {
                                    continueFunctionCallArgs += toolCall.function.arguments;
                                }
                            }
                        }
                        const delta = (_r = choice === null || choice === void 0 ? void 0 : choice.delta) === null || _r === void 0 ? void 0 : _r.content;
                        if (delta) {
                            res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_t && !_d && (_e = continueStream_1.return)) await _e.call(continueStream_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                // Handle tool calls in continue stream if any
                if (continueFinishReason === "tool_calls" && continueFunctionCallName && continueFunctionCallArgs) {
                    try {
                        v2_1.logger.info(`Function call detected in continue stream: ${continueFunctionCallName}`);
                        // Clean function arguments - remove any trailing whitespace or invalid characters
                        let cleanedArgs = continueFunctionCallArgs.trim();
                        // Try to find valid JSON in the string (in case there's extra text)
                        let jsonStart = cleanedArgs.indexOf('{');
                        let jsonEnd = cleanedArgs.lastIndexOf('}');
                        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                            cleanedArgs = cleanedArgs.substring(jsonStart, jsonEnd + 1);
                        }
                        // Additional cleaning: remove any trailing commas or invalid characters
                        // Try to find the last valid closing brace
                        let braceCount = 0;
                        let validEnd = -1;
                        for (let i = 0; i < cleanedArgs.length; i++) {
                            if (cleanedArgs[i] === '{')
                                braceCount++;
                            if (cleanedArgs[i] === '}') {
                                braceCount--;
                                if (braceCount === 0) {
                                    validEnd = i;
                                    break;
                                }
                            }
                        }
                        if (validEnd !== -1) {
                            cleanedArgs = cleanedArgs.substring(0, validEnd + 1);
                        }
                        v2_1.logger.info(`Cleaned continue stream args (length ${cleanedArgs.length}): ${cleanedArgs.substring(0, 200)}...`);
                        // Try to parse - if it fails, log the exact string for debugging
                        let args;
                        try {
                            args = JSON.parse(cleanedArgs);
                        }
                        catch (parseError) {
                            v2_1.logger.error(`JSON parse error in continue stream. Raw string: ${continueFunctionCallArgs}`);
                            v2_1.logger.error(`Cleaned string: ${cleanedArgs}`);
                            v2_1.logger.error(`Parse error: ${parseError}`);
                            throw parseError;
                        }
                        const functionResult = await executeMathTool(continueFunctionCallName, args);
                        // Send tool call result to client
                        res.write(`data: ${JSON.stringify({
                            tool_call: {
                                name: continueFunctionCallName,
                                args: args,
                                result: functionResult,
                            }
                        })}\n\n`);
                    }
                    catch (error) {
                        v2_1.logger.error(`Error handling function call in continue stream: ${error}`);
                        v2_1.logger.error(`Raw continueFunctionCallArgs (length ${continueFunctionCallArgs.length}): ${continueFunctionCallArgs}`);
                        v2_1.logger.error(`Function name: ${continueFunctionCallName}`);
                    }
                }
            }
            catch (error) {
                v2_1.logger.error(`Error handling function call: ${error}`);
                v2_1.logger.error(`Raw functionCallArgs (length ${functionCallArgs.length}): ${functionCallArgs}`);
                v2_1.logger.error(`Function name: ${functionCallName}`);
                // Send error to client but continue stream
                const errorMessage = error instanceof Error ? error.message : String(error);
                res.write(`data: ${JSON.stringify({ error: `Function call error: ${errorMessage}` })}\n\n`);
            }
        }
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
/**
 * HTTP Cloud Function for transcribing audio to text using Whisper-1
 *
 * POST /transcribe
 * Body: FormData with audio file (multipart/form-data)
 *
 * Returns: { text: string } - Transcribed text
 */
exports.transcribe = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 60,
    maxInstances: 10,
}, async (req, res) => {
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
        v2_1.logger.info("Transcribing audio with Whisper-1...");
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
        v2_1.logger.info("Audio transcribed successfully");
        // Return transcribed text
        res.json({ text });
    }
    catch (error) {
        v2_1.logger.error("Error in transcribe function:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * HTTP Cloud Function for extracting topic and difficulty from math problem
 *
 * POST /extract-topic
 * Body: { problem: string }
 *
 * Returns: { topic: string, subTopic?: string, difficulty: string } - Topic metadata
 */
exports.extractTopic = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 60,
    maxInstances: 10,
}, async (req, res) => {
    var _a, _b, _c;
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.status(204).end();
        return;
    }
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    // Only allow POST requests
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const { problem } = req.body;
        // Validate request body
        if (!problem || typeof problem !== "string") {
            res.status(400).json({ error: "Invalid request: problem required" });
            return;
        }
        // Get OpenAI client
        const openai = getOpenAIClient();
        v2_1.logger.info("Extracting topic and difficulty from problem...");
        // Use GPT-4o to analyze problem and extract topic/difficulty
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a math problem analyzer. Analyze the given math problem and return ONLY a JSON object with:
- topic: The main math topic (e.g., "algebra", "geometry", "calculus", "arithmetic", "trigonometry")
- subTopic: A specific sub-topic within the main topic (e.g., "linear_equations", "quadratic_equations", "triangles", "circles", "derivatives", "integrals"). Be specific.
- difficulty: "easy", "medium", or "hard" based on the problem complexity

Return ONLY valid JSON, no other text. Example format:
{"topic": "algebra", "subTopic": "linear_equations", "difficulty": "medium"}`,
                },
                {
                    role: "user",
                    content: `Analyze this math problem and return the topic, subTopic, and difficulty:\n\n${problem}`,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3, // Lower temperature for more consistent topic extraction
            max_tokens: 200,
        });
        const content = (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
        if (!content) {
            res.status(400).json({ error: "Could not extract topic from problem" });
            return;
        }
        // Parse JSON response
        const topicData = JSON.parse(content);
        // Validate response structure
        if (!topicData.topic || !topicData.difficulty) {
            res.status(400).json({ error: "Invalid topic extraction response" });
            return;
        }
        // Validate difficulty
        if (!["easy", "medium", "hard"].includes(topicData.difficulty)) {
            topicData.difficulty = "medium"; // Default to medium if invalid
        }
        v2_1.logger.info("Topic extracted successfully:", topicData);
        // Return topic metadata
        res.json({
            topic: topicData.topic,
            subTopic: topicData.subTopic || null,
            difficulty: topicData.difficulty,
        });
    }
    catch (error) {
        v2_1.logger.error("Error in extractTopic function:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * HTTP Cloud Function for text-to-speech using TTS-1
 *
 * POST /speech
 * Body: { text: string, voice?: string }
 *
 * Returns: Audio file (base64 encoded MP3)
 */
exports.speech = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 60,
    maxInstances: 10,
}, async (req, res) => {
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
        v2_1.logger.info(`Generating speech with TTS-1, voice: ${voice}...`);
        // Generate speech using TTS-1
        const speechResponse = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: text,
            response_format: "mp3",
        });
        // Convert response to buffer
        const buffer = Buffer.from(await speechResponse.arrayBuffer());
        // Convert to base64 for JSON response
        const base64Audio = buffer.toString('base64');
        v2_1.logger.info("Speech generated successfully");
        // Return audio as base64 string
        res.json({ audio: base64Audio, format: "mp3" });
    }
    catch (error) {
        v2_1.logger.error("Error in speech function:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
});
//# sourceMappingURL=index.js.map