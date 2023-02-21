<script lang="ts">
import { onMount } from 'svelte';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { EditorSettings } from '../../../../main/src/plugin/editor-settings';

import type monaco from 'monaco-editor';
import { getPanelDetailColor } from '../color/color';

let divEl: HTMLDivElement = null;
let editor: monaco.editor.IStandaloneCodeEditor;
let Monaco;

export let content = '';
export let language = 'json';

onMount(async () => {
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorker: function (_moduleId: any, label: string) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
  };

  Monaco = await import('monaco-editor');

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    EditorSettings.SectionName + '.' + EditorSettings.FontSize,
  );

  Monaco.editor.defineTheme('podmanDesktopTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: getPanelDetailColor() }],
    colors: {
      'editor.background': getPanelDetailColor(),
    },
  });

  editor = Monaco.editor.create(divEl, {
    value: content,
    fontSize,
    language,
    readOnly: true,
    theme: 'podmanDesktopTheme',
    automaticLayout: true,
  });

  return () => {
    editor.dispose();
  };
});

$: content, editor && editor.getModel().setValue(content);
</script>

<div bind:this="{divEl}" class="h-full"></div>
