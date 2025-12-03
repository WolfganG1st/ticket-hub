import { styleText } from 'node:util';
import { ZodError, type ZodType } from 'zod';
import { getHintForIssue } from './env-hints';

export function parseEnvWithSchema<T>(schema: ZodType<T>, vars: NodeJS.ProcessEnv): T {
  try {
    return schema.parse(vars);
  } catch (error) {
    if (error instanceof ZodError) {
      for (const issue of error.issues) {
        const pathString = issue.path.join('.');
        const variableName = pathString || 'Configuration';
        const _problemMessage = styleText('magenta', issue.message);
        const _hint = getHintForIssue(issue, pathString, variableName);
      }
    }
    throw error;
  }
}
