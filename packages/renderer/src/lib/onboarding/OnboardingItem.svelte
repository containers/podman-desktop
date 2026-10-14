<script lang="ts">
import type { OnboardingStepItem } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { CONFIGURATION_ONBOARDING_SCOPE } from '@desktop-framework/api/configuration';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import type { ContextUI } from '/@/lib/context/context';
import Markdown from '/@/lib/markdown/Markdown.svelte';
import PreferencesRenderingItem from '/@/lib/preferences/PreferencesRenderingItem.svelte';
import { isTargetScope } from '/@/lib/preferences/Util';
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';

import { replaceContextKeyPlaceholders, replaceContextKeyPlaceHoldersByRegex } from './onboarding-utils';

interface Props {
  extension: string;
  item: OnboardingStepItem;
  inProgressCommandExecution: (command: string, state: 'starting' | 'failed' | 'successful', value?: unknown) => void;
}

let { extension, item, inProgressCommandExecution }: Props = $props();

const configurationRegex = new RegExp(/\${configuration:(.+?)}/g);
let html = $state<string>('');
let configurationItems: IConfigurationPropertyRecordedSchema[];
let configurationItem = $state<IConfigurationPropertyRecordedSchema | undefined>();

let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

onMount(() => {
  configurationProperties.subscribe(value => {
    configurationItems = value;
    const matches = [...item.value.matchAll(configurationRegex)];
    if (matches.length > 0 && matches[0].length > 1) {
      configurationItem = configurationItems.find(
        config =>
          isTargetScope(CONFIGURATION_ONBOARDING_SCOPE, config.scope) &&
          config.extension?.id === extension &&
          config.id === matches[0][1],
      );
    }
  });

  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
    updateHtml();
  });

  updateHtml();
});

onDestroy(() => {
  contextsUnsubscribe?.();
});

function updateHtml(): void {
  const itemHtml = replacePlaceholders(item.value);
  if (html !== itemHtml) {
    html = itemHtml;
  }
}

function replacePlaceholders(label: string): string {
  let newLabel = label;
  newLabel = replaceContextKeyPlaceholders(newLabel, extension, globalContext);
  newLabel = replaceContextKeyPlaceHoldersByRegex(configurationRegex, newLabel, undefined, undefined, '');
  return newLabel;
}
</script>

<div
  class="flex justify-center {item.highlight
    ? 'bg-[var(--pd-content-card-inset-bg)] text-[var(--pd-content-card-text)]'
    : ''} p-3 m-2 rounded-md min-w-[500px]">
  {#if html}
    <Markdown inProgressMarkdownCommandExecutionCallback={inProgressCommandExecution} markdown={html} />
  {/if}
  {#if configurationItem}
    <div class="min-w-[500px] bg-[var(--pd-content-card-inset-bg)] text-[var(--pd-content-card-text)] rounded-md">
      <PreferencesRenderingItem record={configurationItem} />
    </div>
  {/if}
</div>
