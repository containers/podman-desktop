<script lang="ts">
import type monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';

import { EditorSettings } from '../../../../main/src/plugin/editor-settings';
import { getPanelDetailColor } from '../color/color';

let divEl: HTMLDivElement;
let editor: monaco.editor.IStandaloneCodeEditor;
let Monaco;

export let content = '';
export let language = 'json';
export let readOnly = true;

const dispatch = createEventDispatcher<{ contentChange: string }>();

onMount(async () => {
  self.MonacoEnvironment = {
    getWorker: function (_moduleId: any, label: string) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
    createTrustedTypesPolicy: () => undefined,
  };

  Monaco = await import('monaco-editor');

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    EditorSettings.SectionName + '.' + EditorSettings.FontSize,
  );

  Monaco.editor.defineTheme('podmanDesktopTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: 'custom-color', background: getPanelDetailColor() }],
    colors: {
      'editor.background': getPanelDetailColor(),
    },
  });

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
});

$: content, editor?.getModel()?.setValue(content);
</script>

<div bind:this={divEl} class="h-full"></div>
