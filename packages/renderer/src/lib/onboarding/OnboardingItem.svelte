<script lang="ts">
import { onMount } from 'svelte';
import type { OnboardingStepItem } from '../../../../main/src/plugin/api/onboarding';
import Markdown from '../markdown/Markdown.svelte';
import type { ContextUI } from '../context/context';
import { replaceContextKeyPlaceHoldersByRegex, replaceContextKeyPlaceholders } from './onboarding-utils';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { configurationProperties } from '/@/stores/configurationProperties';
import PreferencesRenderingItem from '../preferences/PreferencesRenderingItem.svelte';
import { CONFIGURATION_ONBOARDING_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';
import { isTargetScope } from '../preferences/Util';
export let extension: string;
export let item: OnboardingStepItem;
export let getContext: () => ContextUI;
export let inProgressCommandExecution: (
  command: string,
  state: 'starting' | 'failed' | 'successful',
  value?: unknown,
) => void;

const configurationRegex = new RegExp(/\${configuration:(.+?)}/g);
let html: string;
$: html;
let configurationItems: IConfigurationPropertyRecordedSchema[];
let configurationItem: IConfigurationPropertyRecordedSchema | undefined;
$: configurationItem;

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

  const itemHtml = replacePlaceholders(item.value);
  html = itemHtml;
});

function replacePlaceholders(label: string): string {
  let newLabel = label;
  const context = getContext();
  newLabel = replaceContextKeyPlaceholders(newLabel, extension, context);
  newLabel = replaceContextKeyPlaceHoldersByRegex(configurationRegex, newLabel, undefined, undefined, '');
  return newLabel;
}
</script>

<div class="flex justify-center {item.highlight ? 'bg-charcoal-600' : ''} p-3 m-2 rounded-md min-w-[500px]">
  {#if html}
    <Markdown inProgressMarkdownCommandExecutionCallback="{inProgressCommandExecution}">{html}</Markdown>
  {/if}
  {#if configurationItem}
    <div class="min-w-[500px] bg-charcoal-600 rounded-md">
      <PreferencesRenderingItem record="{configurationItem}" />
    </div>
  {/if}
</div>
