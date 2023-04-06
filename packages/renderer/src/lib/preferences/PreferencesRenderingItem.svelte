<script lang="ts">
import { afterUpdate } from 'svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

export let record: IConfigurationPropertyRecordedSchema;

let recordUI: {
  title: string;
  breadCrumb: string;
  description: string;
  original: IConfigurationPropertyRecordedSchema;
};

afterUpdate(() => {
  update();
});

// add space from camel case and upper case on the first letter
function startCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => {
    return str.toUpperCase();
  });
}
function update() {
  const id = record.id;
  // take string after the last dot
  const key = id.substring(id.lastIndexOf('.') + 1);

  // define bread crumb as first part before the last dot
  const breadCrumb = id.substring(0, id.lastIndexOf('.'));
  // and replace dot by > in breadcrumb
  const breadCrumbUI = breadCrumb.replace(/\./g, ' > ').concat(':');

  recordUI = {
    title: startCase(key),
    breadCrumb: breadCrumbUI,
    description: record.description,
    original: record,
  };
}
$: {
  update();
}

function updateResetButtonVisibility(recordValue: any) {
  showResetButton =
    recordUI.original.default !== undefined && recordValue !== undefined && recordValue != recordUI.original.default;
}

function doResetToDefault() {
  resetToDefault = true;
}

$: showResetButton = false;
$: resetToDefault = false;
</script>

<div class="flex flex-row px-2 py-2 justify-between w-full">
  <div
    class="flex flex-col {recordUI.original.type === 'string' &&
    (!recordUI.original.enum || recordUI.original.enum.length === 0)
      ? 'w-full'
      : ''}">
    <div class="flex flex-row text-sm">
      {recordUI.title}
      {#if showResetButton}
        <div class="ml-2">
          <button class="text-xs text-violet-500" on:click="{() => doResetToDefault()}">
            <i class="fas fa-undo" aria-hidden="true"></i>
          </button>
        </div>
      {/if}
    </div>
    <div class="pt-1 text-gray-400 text-xs pr-2">{recordUI.description}</div>
    {#if recordUI.original.type === 'string' && (!recordUI.original.enum || recordUI.original.enum.length === 0)}
      <PreferencesRenderingItemFormat
        showUpdate="{false}"
        record="{recordUI.original}"
        updateResetButtonVisibility="{updateResetButtonVisibility}"
        resetToDefault="{resetToDefault}" />
    {/if}
  </div>
  {#if recordUI.original.type !== 'string' || (recordUI.original.enum && recordUI.original.enum.length > 0)}
    <PreferencesRenderingItemFormat
      showUpdate="{false}"
      record="{recordUI.original}"
      updateResetButtonVisibility="{updateResetButtonVisibility}"
      resetToDefault="{resetToDefault}" />
  {/if}
</div>
