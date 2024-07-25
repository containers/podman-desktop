<script lang="ts">
import {
  faCheckSquare,
  faCircleMinus,
  faExclamationCircle,
  faExclamationTriangle,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { ImageCheck } from '@podman-desktop/api';
import { Spinner } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { ImageCheckerInfo } from '/@api/image-checker-info';

import type { ProviderUI } from './ProviderResultPage';
import SlideToggle from './SlideToggle.svelte';
import ToggleButton from './ToggleButton.svelte';
import ToggleButtonGroup from './ToggleButtonGroup.svelte';

interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}

export let providers: ProviderUI[] = [];

export let results: CheckUI[] = [];

let selectedProviders = new Map<string, boolean>();

const selectedSeverities = {
  critical: true,
  high: true,
  medium: true,
  low: true,
  success: true,
};

$: resultsFilteredByProvider = getFilteredResultsByProvider(results, selectedProviders);
$: countBySeverity = getCountBySeverity(resultsFilteredByProvider);
$: filtered = getFilteredResultsBySeverity(resultsFilteredByProvider, selectedSeverities);

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

function getCountBySeverity(results: CheckUI[]): {
  critical: number;
  high: number;
  medium: number;
  low: number;
  success: number;
} {
  return results.reduce(
    (acc, current) => {
      if (current.check.status === 'success') {
        acc['success']++;
        return acc;
      }
      if (!current.check.severity) {
        return acc;
      }
      acc[current.check.severity]++;
      return acc;
    },
    {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      success: 0,
    },
  );
}

function onProviderChecked(id: string, checked: boolean): void {
  selectedProviders.set(id, checked);
  selectedProviders = selectedProviders;
}

function getFilteredResultsByProvider(results: CheckUI[], checkedProviders: Map<string, boolean>): CheckUI[] {
  return results.filter(r => checkedProviders.get(r.provider.id) === undefined || checkedProviders.get(r.provider.id));
}

function getFilteredResultsBySeverity(results: CheckUI[], selectedSeverities: any): CheckUI[] {
  return results.filter(r => {
    if (r.check.status === 'success') {
      return selectedSeverities['success'];
    }
    if (r.check.severity) {
      return selectedSeverities[r.check.severity];
    }
    return true;
  });
}

function onSeverityClicked(severity: 'critical' | 'high' | 'medium' | 'low' | 'success', clicked: boolean): void {
  selectedSeverities[severity] = clicked;
}
</script>

<div class="flex flex-col w-full h-full p-8 pr-0">
  <div class="pr-4">
    <slot name="header-info" />
  </div>
  <div class="mb-2 flex flex-row pr-12 pb-2">
    <span class="grow">Checkers</span>
    <div>
      <ToggleButtonGroup>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.critical === 0}
          icon={faExclamationCircle}
          iconClass="text-red-600"
          on:click={event => onSeverityClicked('critical', event.detail)}
          >Critical ({countBySeverity.critical})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.high === 0}
          icon={faExclamationTriangle}
          iconClass="text-amber-500"
          on:click={event => onSeverityClicked('high', event.detail)}>High ({countBySeverity.high})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.medium === 0}
          icon={faExclamationTriangle}
          iconClass="text-gray-800"
          on:click={event => onSeverityClicked('medium', event.detail)}>Medium ({countBySeverity.medium})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.low === 0}
          icon={faCircleMinus}
          iconClass="text-gray-500"
          on:click={event => onSeverityClicked('low', event.detail)}>Low ({countBySeverity.low})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.success === 0}
          icon={faCheckSquare}
          iconClass="text-green-500"
          on:click={event => onSeverityClicked('success', event.detail)}
          >Passed ({countBySeverity.success})</ToggleButton>
      </ToggleButtonGroup>
    </div>
  </div>
  <div class="h-full flex flex-row space-x-8">
    <div class="h-full overflow-y-auto w-1/3">
      {#each providers as provider}
        <div role="row" class="rounded-lg bg-charcoal-700 mb-4 p-4 flex flex-col">
          <div class="flex flex-row items-center">
            <span class="grow">{provider.info.label}</span>
            {#if provider.state === 'running'}
              <Spinner size="12"></Spinner>
            {/if}
            {#if provider.state === 'failed'}
              <span class="text-red-600 mt-1">
                <Fa size="1.1x" icon={faExclamationTriangle} />
              </span>
            {/if}
            {#if provider.state === 'canceled'}
              <span class="text-gray-500">
                <Fa size="1.1x" icon={faCircleMinus} />
              </span>
            {/if}
            {#if provider.state === 'success'}
              <SlideToggle
                id={provider.info.id}
                on:checked={event => onProviderChecked(provider.info.id, event.detail)}
                checked={selectedProviders.get(provider.info.id) ?? true} />
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
    <div class="h-full w-full pr-4 overflow-y-scroll pb-16">
      {#each filtered as result}
        <div
          role="row"
          class="rounded-r-lg bg-charcoal-700 mb-4 mr-4 p-4 border-l-2"
          class:border-l-red-600={result.check.severity === 'critical'}
          class:border-l-amber-500={result.check.severity === 'high'}
          class:border-l-gray-800={result.check.severity === 'medium'}
          class:border-l-gray-500={result.check.severity === 'low'}
          class:border-l-green-500={result.check.status === 'success'}>
          <div class="flex flex-row space-x-2">
            <span
              class:text-red-600={result.check.severity === 'critical'}
              class:text-amber-500={result.check.severity === 'high'}
              class:text-gray-800={result.check.severity === 'medium'}
              class:text-gray-500={result.check.severity === 'low'}
              class:text-green-500={result.check.status === 'success'}
              ><Fa size="1.1x" class="mt-1" icon={getIcon(result.check)} />
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
