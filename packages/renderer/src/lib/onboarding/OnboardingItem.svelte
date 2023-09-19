<script lang="ts">
import { onMount } from 'svelte';
import type { OnboardingStepItem } from '../../../../main/src/plugin/api/onboarding';
import Markdown from '../markdown/Markdown.svelte';
import type { ContextUI } from '../context/context';
import { SCOPE_ONBOARDING } from './onboarding-utils';
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

const onboardingContextRegex = new RegExp(/\${onboardingContext:(.+?)}/g);
const configurationRegex = new RegExp(/\${configuration:(.+?)}/g);
const globalContextRegex = new RegExp(/\${onContext:(.+?)}/g);
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
          !config.hidden &&
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
  newLabel = replacePlaceHoldersRegex(onboardingContextRegex, newLabel, `${extension}.${SCOPE_ONBOARDING}`);
  newLabel = replacePlaceHoldersRegex(globalContextRegex, newLabel);
  newLabel = replacePlaceHoldersRegex(configurationRegex, newLabel, undefined, '');
  return newLabel;
}

function replacePlaceHoldersRegex(regex: RegExp, label: string, prefix?: string, replacement?: string) {
  const matches = [...label.matchAll(regex)];
  for (const match of matches) {
    label = getNewValue(label, match, prefix, replacement);
  }
  return label;
}

function getNewValue(label: string, matchArray: RegExpMatchArray, prefix?: string, replacement?: string) {
  if (matchArray.length > 1) {
    const key = prefix ? `${prefix}.${matchArray[1]}` : matchArray[1];
    if (replacement === undefined) {
      replacement = getContext().getValue(key);
    }
    if (replacement !== undefined) {
      return label.replace(matchArray[0], replacement.toString());
    }
  }
  return label;
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
