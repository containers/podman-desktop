import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import MonacoEditor from './MonacoEditor.svelte';

async function waitRender(customProperties: object): Promise<void> {
  const result = render(MonacoEditor, { ...customProperties });
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

vi.mock('monaco-editor');
vi.mock('@monaco-editor/react');

beforeEach(() => {
  vi.clearAllMocks();
});

test('Render monaco editor with json content and expect to have the correct content', async () => {
    const content = '{"key": "value"}';
    await waitRender({
        content: content,
        language: 'json',
        readOnly: true,
    });

    const editor = screen.getByTestId('monaco');
    expect(editor).toHaveTextContent(content);
});