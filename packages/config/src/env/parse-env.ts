import { styleText } from 'node:util';
import { ZodError, type ZodType } from 'zod';
import { getHintForIssue } from './env-hints';

export function parseEnvWithSchema<T>(schema: ZodType<T>, vars: NodeJS.ProcessEnv): T {
  try {
    return schema.parse(vars);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Invalid environment variables:');
      for (const issue of error.issues) {
        const pathString = issue.path.join('.');
        const variableName = pathString || 'Configuration';
        const problemMessage = styleText('magenta', issue.message);
        const hint = getHintForIssue(issue, pathString, variableName);

        console.error(`  ➡️  ${styleText('yellow', 'Variable:')} ${styleText('cyan', variableName)}`);
        console.error(`     ${styleText('yellow', 'Problem:')} ${problemMessage}${hint}\n`);
      }
      console.error(styleText(['red', 'bold'], 'Please correct the issues listed above and restart the application.'));
    }
    throw error;
  }
}
