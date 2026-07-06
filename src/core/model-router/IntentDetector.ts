/**
 * IntentDetector.ts
 *
 * Heuristic-based intent classification — no AI call needed.
 * Classifies a user message into a RequestIntent so ModelRouter can
 * pick the optimal model for the task.
 */

export type RequestIntent = "chat" | "code" | "reasoning" | "vision" | "embeddings" | "fast";

/**
 * Detect the intent of a user message based on simple heuristics.
 * @param message     The raw user input
 * @param hasAttachment Whether an image/file is attached
 */
export function detectIntent(message: string, hasAttachment = false): RequestIntent {
  // Vision takes priority when an image is attached
  if (hasAttachment) return "vision";

  const lower = message.toLowerCase();

  // Code: code fences, common programming keywords
  const CODE_PATTERNS = [
    /```[\s\S]*/,
    /\bwrite\b.*\b(code|function|class|script|program)\b/,
    /\b(typescript|javascript|python|rust|go|java|c\+\+|sql|bash|css|html)\b/,
    /\b(debug|refactor|implement|build|test|lint)\b/,
    /def |const |function |import |class |return |export /,
  ];
  if (CODE_PATTERNS.some((p) => p.test(lower))) return "code";

  // Reasoning: logical, analytical, math
  const REASONING_PATTERNS = [
    /\b(why|how|explain|analyze|compare|reason|think|solve|calculate|proof|derive)\b/,
    /\b(step[\s-]by[\s-]step|walk me through|break down)\b/,
    /\b(math|equation|formula|algebra|calculus|statistics)\b/,
    /\d+\s*[+\-*/]\s*\d+/, // arithmetic expression
  ];
  if (REASONING_PATTERNS.some((p) => p.test(lower))) return "reasoning";

  // Fast: short, conversational single-sentence questions
  if (message.trim().split(" ").length <= 8) return "fast";

  // Default: balanced chat
  return "chat";
}
