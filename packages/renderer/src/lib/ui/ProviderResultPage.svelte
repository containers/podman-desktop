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
import SlideToggle from './SlideToggle.svelte';

interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}

export let providers: ProviderUI[] = [];

export let results: CheckUI[] = [];

$: checkedProviders = getCheckedProviders(providers);
$: filteredResults = getFilteredResults(results, checkedProviders);

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

function getCheckedProviders(providers: ProviderUI[]): string[] {
  return providers.filter(p => p.checked === undefined || p.checked).map(p => p.info.id);
}

function onProviderChecked(id: string, checked: boolean) {
  providers = providers.map(p => {
    if (p.info.id === id) {
      p.checked = checked;
    }
    return p;
  });
}

function getFilteredResults(results: CheckUI[], checkedProviders: string[]): CheckUI[] {
  return results.filter(r => checkedProviders.includes(r.provider.id));
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
          <div class="flex flex-row items-center">
            <span class="grow">{provider.info.label}</span>
            {#if provider.state === 'running'}
              <Spinner size="12"></Spinner>
            {/if}
            {#if provider.state === 'failed'}
              <span class="text-red-600 mt-1">
                <Fa size="18" icon="{faExclamationTriangle}" />
              </span>
            {/if}
            {#if provider.state === 'canceled'}
              <span class="text-gray-500">
                <Fa size="18" icon="{faCircleMinus}" />
              </span>
            {/if}
            {#if provider.state === 'success'}
              <SlideToggle
                on:checked="{event => onProviderChecked(provider.info.id, event.detail)}"
                checked="{provider.checked ?? true}" />
            {/if}
          </div>
          {#if provider.error}
            <div class="text-red-500 text-sm">{provider.error}</div>
          {/if}
          {#if provider.state === 'canceled'}
            <div class="text-gray-900 text-sm">Canceled by user</div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="h-full w-full pr-4 overflow-y-auto pb-16">
      {#each filteredResults as result}
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
            <div class="font-bold">{result.check.name}</div>
            <div class="text-gray-900 text-sm grow text-right">Reported by {result.provider.label}</div>
          </div>
          {#if result.check.markdownDescription}
            <div class="mt-4">{result.check.markdownDescription}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
