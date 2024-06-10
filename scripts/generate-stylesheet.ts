import { ColorRegistry } from '../packages/main/src/plugin/color-registry';
import type { ApiSenderType } from '../packages/main/src/plugin/api';
import type { ConfigurationRegistry } from '../packages/main/src/plugin/configuration-registry';
import type { ColorInfo } from '../packages/api/src/color-info';
import { writeFileSync } from 'node:fs';

const apiSenderTypeMock: ApiSenderType = {
  send: () => {},
  receive: () => ({ dispose: () => {} }),
};

const configurationRegistryMock: ConfigurationRegistry = {
  onDidChangeConfiguration: () => {},
} as unknown as ConfigurationRegistry;

// Create color registry
const registry = new ColorRegistry(apiSenderTypeMock, configurationRegistryMock);
registry.init();

function getStylesheet(themeName: string): string {
  const colors = registry.listColors(themeName);
  const styles: string[] = [];
  colors.forEach((color: ColorInfo) => {
    const cssVar = color.cssVar;
    const colorValue = color.value;

    styles.push(`${cssVar}: ${colorValue};`);
  });
  return `
  :root {
    ${styles.join('\n')}
  }
`;
}

function getArgument(key: string): string {
  const args = process.argv.slice(2);

  const index = args.indexOf(key);
  if (index === -1 || args.length <= index + 1) throw new Error(`argument ${key} not defined.`);
  return args[index + 1];
}

const output = getArgument('--output');
const theme = getArgument('--theme');
const stylesheet = getStylesheet(theme);

writeFileSync(output, stylesheet);
