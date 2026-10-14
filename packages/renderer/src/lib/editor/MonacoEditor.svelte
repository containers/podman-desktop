<script lang="ts">
import { EditorSettings } from '@desktop-framework/api/editor';
import type monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker?worker';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { AppearanceUtil } from '/@/lib/appearance/appearance-util';
import { isDark } from '/@/stores/appearance';

interface Props {
  content?: string;
  language?: string;
  readOnly?: boolean;
}

let { content = '', language = 'json', readOnly = true }: Props = $props();

let divEl: HTMLDivElement;
let editor: monaco.editor.IStandaloneCodeEditor;
let Monaco;
let isDarkUnsubscribe: Unsubscriber;

const dispatch = createEventDispatcher<{ contentChange: string }>();

async function updateTheme(isDarkTheme: boolean): Promise<void> {
  Monaco = await import('monaco-editor');
  // check if we're in light or dark mode and get the terminal background color
  const appearanceUtil = new AppearanceUtil();
  const bgColor = appearanceUtil.getColor('--pd-terminal-background');

  // create a theme with the current light or dark mode, but customize the background color
  Monaco.editor.defineTheme('podmanDesktopTheme', {
    base: isDarkTheme ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [{ token: 'custom-color', background: bgColor }],
    colors: {
      'editor.background': bgColor,
      // make the --vscode-focusBorder transparent
      focusBorder: '#00000000',
    },
  });
}

onMount(async () => {
  isDarkUnsubscribe = isDark.subscribe(value => {
    updateTheme(value).catch((err: unknown) => console.log(`Error updating theme to ${value}`, err));
  });

  self.MonacoEnvironment = {
    getWorker: function (_moduleId: unknown, label: string): Worker {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
    createTrustedTypesPolicy: (): undefined | monaco.ITrustedTypePolicy => undefined,
  };

  Monaco = await import('monaco-editor');

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    EditorSettings.SectionName + '.' + EditorSettings.FontSize,
  );

  editor = Monaco.editor.create(divEl, {
    value: content,
    fontSize,
    language,
    readOnly: readOnly,
    theme: 'podmanDesktopTheme',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  });

  editor.onDidChangeModelContent(() => {
    // Emit the content change so we can use it in the parent component
    dispatch('contentChange', editor.getValue());
  });
});

onDestroy(() => {
  editor?.dispose();
  if (isDarkUnsubscribe) {
    isDarkUnsubscribe();
  }
});

$effect(() => {
  editor?.getModel()?.setValue(content);
});
</script>

<div bind:this={divEl} class="h-full"></div>
