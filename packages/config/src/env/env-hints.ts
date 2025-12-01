import { styleText } from 'node:util';
import type { z } from 'zod';

export function getHintForIssue(issue: z.core.$ZodIssue, pathString: string, variableName: string): string {
  const numericPaths = ['PORT'];

  if (numericPaths.includes(pathString) && issue.code === 'invalid_type') {
    if ('received' in issue && issue.received === 'nan') {
      return styleText(
        'gray',
        `\n     ${styleText('cyanBright', 'Hint:')} '${variableName}' must be a number but was processed as NaN (Not a Number). This often happens if the value contains non-numeric characters (e.g., inline comments like '#...'). Please provide a clean numeric value.`,
      );
    }
    if ('received' in issue && 'expected' in issue) {
      return styleText(
        'gray',
        `\n     ${styleText('cyanBright', 'Hint:')} '${variableName}' must be a number. Received a value that could not be coerced to a number (type found: ${issue.received}, expected: ${issue.expected}). Please provide a clean numeric value.`,
      );
    }
  }

  if (issue.code === 'invalid_value') {
    if ('received' in issue && 'options' in issue && Array.isArray(issue.options)) {
      return styleText(
        'gray',
        `\n     ${styleText('cyanBright', 'Hint:')} The value '${String(issue.received)}' for '${variableName}' is not allowed. Expected one of: ${issue.options.join(' | ')}.`,
      );
    }
  }

  return '';
}
