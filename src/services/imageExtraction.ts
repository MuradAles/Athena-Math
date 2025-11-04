/**
 * Image extraction service
 * Extracts math problems from images using GPT-4 Vision via Cloud Function
 */

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '';
const REGION = 'us-central1'; // Default region for Cloud Functions
const USE_EMULATOR = import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';

/**
 * Extract math problem from image URL
 * Uses GPT-4 Vision via Cloud Function
 */
export const extractProblemFromImage = async (imageUrl: string): Promise<string> => {
  try {
    // Construct Cloud Function URL (same pattern as useStreaming)
    // Note: Function name is extractProblem (camelCase), not extract-problem
    let functionUrl: string;
    if (USE_EMULATOR) {
      // For emulator: http://127.0.0.1:5001/{PROJECT_ID}/{REGION}/{FUNCTION_NAME}
      functionUrl = `http://127.0.0.1:5001/${PROJECT_ID || 'athena'}/${REGION}/extractProblem`;
    } else {
      // For production: https://{REGION}-{PROJECT_ID}.cloudfunctions.net/{FUNCTION_NAME}
      functionUrl = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/extractProblem`;
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to extract problem: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.problem || typeof data.problem !== 'string') {
      throw new Error('Invalid response format from extraction service');
    }

    return data.problem.trim();
  } catch (error) {
    console.error('Error extracting problem from image:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to extract problem from image';
    throw new Error(errorMessage);
  }
};

