/**
 * A utility to repair common issues in JSON strings returned by LLMs.
 * Handles markdown blocks, trailing commas, and basic unclosed structures.
 */
export const repairJson = (jsonString: string): string => {
  let cleaned = jsonString.trim();

  // 1. Remove Markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }

  // 2. Remove comments (// or /* */) which AI sometimes includes
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

  // 3. Fix common trailing comma issues in arrays or objects
  // This regex looks for a comma followed by closing brackets/braces
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // 4. Basic check for unclosed brackets/braces
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;

  if (openBraces > closeBraces) {
    cleaned += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    cleaned += ']'.repeat(openBrackets - closeBrackets);
  }

  return cleaned;
};

/**
 * Safely parses JSON after attempting repairs.
 */
export const safeParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    const repaired = repairJson(jsonString);
    return JSON.parse(repaired) as T;
  } catch (e) {
    console.error("JSON Repair/Parse failed:", e);
    return defaultValue;
  }
};
