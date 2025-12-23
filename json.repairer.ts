
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

  // 2. Remove comments (// or /* */) but PROTECT URLs (http://)
  // The regex (?<!:) ensures we don't match // inside a URL protocol
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|(?<!:)\/\/.*$/gm, '');

  // 3. Fix common trailing comma issues in arrays or objects
  // This regex looks for a comma followed by closing brackets/braces
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // 4. Basic check for unclosed brackets/braces
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;

  // Close arrays first, then objects (common JSON structure)
  if (openBrackets > closeBrackets) {
    cleaned += ']'.repeat(openBrackets - closeBrackets);
  }
  if (openBraces > closeBraces) {
    cleaned += '}'.repeat(openBraces - closeBraces);
  }

  return cleaned;
};

/**
 * Safely parses JSON after attempting repairs.
 */
export const safeParse = <T>(jsonString: string, defaultValue: T): T => {
  // Pre-process: Fix common LaTeX escape issues where AI forgets double backslash
  let processed = jsonString;
  const latexCommands = ['frac', 'sum', 'int', 'alpha', 'beta', 'gamma', 'pi', 'sqrt', 'text', 'mathbf', 'cdot', 'infty', 'approx'];
  
  latexCommands.forEach(cmd => {
      // Replace \cmd with \\cmd (but not if it's already \\cmd)
      // Regex explanation: Look for \cmd that is NOT preceded by a \
      const regex = new RegExp(`(?<!\\\\)\\\\${cmd}`, 'g');
      processed = processed.replace(regex, `\\\\${cmd}`);
  });
  
  // Also fix [ ] and ( ) used in LaTeX math but interpreted as JSON sometimes
  // This is harder to do safely via regex without context, so we focus on commands first.

  try {
    const repaired = repairJson(processed);
    return JSON.parse(repaired) as T;
  } catch (e) {
    console.error("JSON Repair/Parse failed. Input:", jsonString.slice(0, 100) + "...", "Error:", e);
    return defaultValue;
  }
};
