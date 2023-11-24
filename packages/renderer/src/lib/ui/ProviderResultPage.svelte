<script lang="ts">
import type { ImageCheck } from '@podman-desktop/api';
import type { ImageCheckerInfo } from '../../../../main/src/plugin/api/image-checker-info';
import Fa from 'svelte-fa';
import {
  faCheckSquare,
  faCircleMinus,
  faExclamationCircle,
  faExclamationTriangle,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { ProviderUI } from './ProviderResultPage';
import Spinner from './Spinner.svelte';

interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}

export let providers: ProviderUI[] = [];

export let results: CheckUI[] = [];

function getIcon(check: ImageCheck): IconDefinition {
  if (check.status === 'success') {
    return faCheckSquare;
  }
  switch (check.severity) {
    case 'critical':
      return faExclamationCircle;
    case 'high':
    case 'medium':
      return faExclamationTriangle;
    default:
      return faCircleMinus;
  }
}
</script>

<div class="flex flex-col w-full h-full p-8 pr-0">
  <div class="pr-4">
    <slot name="header-info" />
  </div>
  <div class="mb-2">Checkers</div>
  <div class="h-full flex flex-row space-x-8">
    <div class="h-full overflow-y-auto w-1/3">
      {#each providers as provider}
        <div class="rounded-lg bg-charcoal-700 mb-4 p-4 flex flex-col">
          <div class="flex flex-row">
            <span class="w-full">{provider.info.label}</span>
            {#if provider.state === 'running'}
              <Spinner size="12"></Spinner>
            {/if}
            {#if provider.state === 'failed'}
              <span class="text-red-600 mt-1">
                <Fa size="18" icon="{faExclamationTriangle}" />
              </span>
            {/if}
          </div>
          {#if provider.error}
            <div class="text-red-500 text-sm">{provider.error}</div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="h-full w-full pr-4 overflow-y-auto pb-16">
      {#each results as result}
        <div
          class="rounded-r-lg bg-charcoal-700 mb-4 mr-4 p-4 border-l-2"
          class:border-l-red-600="{result.check.severity === 'critical'}"
          class:border-l-amber-500="{result.check.severity === 'high'}"
          class:border-l-gray-800="{result.check.severity === 'medium'}"
          class:border-l-gray-500="{result.check.severity === 'low'}"
          class:border-l-green-500="{result.check.status === 'success'}">
          <div class="flex flex-row space-x-2">
            <span
              class:text-red-600="{result.check.severity === 'critical'}"
              class:text-amber-500="{result.check.severity === 'high'}"
              class:text-gray-800="{result.check.severity === 'medium'}"
              class:text-gray-500="{result.check.severity === 'low'}"
              class:text-green-500="{result.check.status === 'success'}"
              ><Fa size="18" class="mt-1" icon="{getIcon(result.check)}" />
            </span>
            <div class="font-bold whitespace-nowrap">{result.check.name}</div>
            <div class="text-gray-900 text-sm w-full text-right">Reported by {result.provider.label}</div>
          </div>
          {#if result.check.markdownDescription}
            <div class="mt-4">{result.check.markdownDescription}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
