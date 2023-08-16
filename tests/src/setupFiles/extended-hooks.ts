import type { PDRunnerTestContext } from 'vitest';
import { afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

afterEach(async (context: PDRunnerTestContext) => {
  context.onTestFailed(async () => {
    const normalizedFilePath = context.task.name
      .replace(/'/g, '')
      .replace(/\//g, '_')
      .replace(/:/g, '_')
      .replace(/ /g, '_');
    let fileName = `${normalizedFilePath}_failure`;
    let counter = 0;
    while (fs.existsSync(path.resolve(context.pdRunner.getTestOutput(), 'screenshots', `${fileName}.png`))) {
      counter++;
      fileName = `${fileName}_${counter}`;
      if (counter > 10) break;
    }
    console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
    await context.pdRunner.screenshot(`${fileName}.png`);
  });
});
