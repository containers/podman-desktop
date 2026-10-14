<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { faArrowUpRightFromSquare, faFlask } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import Markdown from '/@/lib/markdown/Markdown.svelte';
import { getInitialValue } from '/@/lib/preferences/Util';
import Label from '/@/lib/ui/Label.svelte';
import RefreshButton from '/@/lib/ui/RefreshButton.svelte';

import PreferencesManagedLabel from './PreferencesManagedLabel.svelte';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

interface Props {
  record: IConfigurationPropertyRecordedSchema;
  title?: 'full' | 'short';
}

const { record, title = 'short' }: Props = $props();
let showResetButton = $state(false);
let resetToDefault = $state(false);

// add space from camel case and upper case on the first letter
function startCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => {
    return str.toUpperCase();
  });
}
const recordUI = $derived.by(() => {
  const id = record.id;

  // split id
  const split: string[] = id?.split('.') ?? [''];

  // take string after the last dot
  let key: string;
  switch (title) {
    case 'full':
      key = split.join(' ');
      break;
    case 'short':
      key = split[split.length - 1];
      break;
  }
  // define bread crumb as first part before the last dot
  const breadCrumb = id?.substring(0, id?.lastIndexOf('.')) ?? '';
  // and replace dot by > in breadcrumb
  const breadCrumbUI = breadCrumb.replace(/\./g, ' > ').concat(':');

  return {
    title: record.displayName ?? startCase(key),
    breadCrumb: breadCrumbUI,
    description: record.description,
    markdownDescription: record.markdownDescription,
    original: record,
    experimental: record.experimental,
  };
});

$effect(() => {
  showResetButton = false;
  resetToDefault = false;
});

function updateResetButtonVisibility(recordValue: unknown): void {
  showResetButton =
    recordUI.original.default !== undefined && recordValue !== undefined && recordValue !== recordUI.original.default;
  // when the reset button is shown we reset the value of resetToDefault
  if (showResetButton) {
    resetToDefault = false;
  }
}

function doResetToDefault(): void {
  if (record.locked) return;
  resetToDefault = true;
}

async function openGitHubDiscussion(): Promise<void> {
  if (!recordUI.experimental?.githubDiscussionLink) return;

  return window.openExternal(recordUI.experimental.githubDiscussionLink);
}
</script>

<div class="flex flex-col px-2 py-2 w-full text-[color:var(--pd-invert-content-card-text)] space-y-4">
  <div class="flex flex-row justify-between">
    <div
      class="flex flex-col {recordUI.original.type === 'string' &&
    (!recordUI.original.enum || recordUI.original.enum.length === 0)
      ? 'w-full'
      : ''}">
      <div class="flex flex-row text-[color:var(--pd-invert-content-card-text)]">
        <div class="flex flex-row space-x-2 items-center">
          <span class="font-semibold">{recordUI.title}</span>
         
          {#if record.locked}
            <PreferencesManagedLabel />
          {/if}
          {#if record.experimental !== undefined}
            <Label>
              <div class="flex flex-row space-x-1 items-center">
                <Icon title="experimental" size="xs" icon={faFlask}/>
                <span>Experimental</span>
              </div>
            </Label>
          {/if}
        </div>
        {#if showResetButton && !record.locked}
          <div class="ml-2">
            <RefreshButton label="Reset to default value" onclick={doResetToDefault} />
          </div>
        {/if}
      </div>
      {#if recordUI.markdownDescription && recordUI.original.type !== 'markdown'}
        <div class="pt-1 text-[color:var(--pd-invert-content-card-text)] text-sm pr-2">
          <Markdown markdown={recordUI.markdownDescription} />
        </div>
      {:else}
        <div class="pt-1 text-[color:var(--pd-invert-content-card-text)] text-sm pr-2">{recordUI.description}</div>
      {/if}
      {#if recordUI.original.type === 'string' && (!recordUI.original.enum || recordUI.original.enum.length === 0)}
        <PreferencesRenderingItemFormat
          record={recordUI.original}
          updateResetButtonVisibility={updateResetButtonVisibility}
          resetToDefault={resetToDefault}
          enableAutoSave={true}
          initialValue={getInitialValue(recordUI.original)} />
      {/if}
    </div>
    {#if recordUI.original.type !== 'string' || (recordUI.original.enum && recordUI.original.enum.length > 0)}
      <PreferencesRenderingItemFormat
        record={recordUI.original}
        updateResetButtonVisibility={updateResetButtonVisibility}
        resetToDefault={resetToDefault}
        enableAutoSave={true}
        initialValue={getInitialValue(recordUI.original)} />
    {/if}
  </div>
  {#if record.experimental?.githubDiscussionLink}
    <Button
      padding="px-3 py-1"
      class="w-min"
      title="Share feedback on GitHub discussion"
      icon={faArrowUpRightFromSquare}
      on:click={openGitHubDiscussion}
    >Share feedback</Button>
  {/if}
</div>
