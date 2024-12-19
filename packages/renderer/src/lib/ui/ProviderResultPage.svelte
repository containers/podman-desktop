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
import type { Snippet } from 'svelte';
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
interface Props {
  providers?: ProviderUI[];
  results?: CheckUI[];
  headerInfo: Snippet;
}

const { headerInfo, providers = [], results = [] }: Props = $props();

let selectedProviders = $state(new Map<string, boolean>());
const selectedSeverities = $state({
  critical: true,
  high: true,
  medium: true,
  low: true,
  success: true,
});

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

const resultsByProviders = $derived(
  results.filter(r => selectedProviders.get(r.provider.id) === undefined || selectedProviders.get(r.provider.id)),
);

const countBySeverity = $derived(
  resultsByProviders.reduce(
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
  ),
);

const filtered = $derived(
  resultsByProviders.filter(r => {
    if (r.check.status === 'success') {
      return selectedSeverities['success'];
    }
    if (r.check.severity) {
      return selectedSeverities[r.check.severity];
    }
    return true;
  }),
);

function onProviderChecked(id: string, checked: boolean): void {
  selectedProviders.set(id, checked);
  selectedProviders = new Map(selectedProviders);
}

function onSeverityClicked(severity: 'critical' | 'high' | 'medium' | 'low' | 'success', clicked: boolean): void {
  selectedSeverities[severity] = clicked;
}
</script>

<div class="flex flex-col w-full h-full p-8 pr-0">
  <div class="pr-4">
    {@render headerInfo()}
  </div>
  <div class="mb-2 flex flex-row pr-12 pb-2">
    <span class="grow">Checkers</span>
    <div>
      <ToggleButtonGroup>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.critical === 0}
          icon={faExclamationCircle}
          iconClass="text-[var(--pd-state-error)]"
          on:click={event => onSeverityClicked('critical', event.detail)}
          >Critical ({countBySeverity.critical})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.high === 0}
          icon={faExclamationTriangle}
          iconClass="text-[var(--pd-state-warning)]"
          on:click={event => onSeverityClicked('high', event.detail)}>High ({countBySeverity.high})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.medium === 0}
          icon={faExclamationTriangle}
          iconClass="text-[var(--pd-severity-medium)]"
          on:click={event => onSeverityClicked('medium', event.detail)}>Medium ({countBySeverity.medium})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.low === 0}
          icon={faCircleMinus}
          iconClass="text-[var(--pd-severity-low)]"
          on:click={event => onSeverityClicked('low', event.detail)}>Low ({countBySeverity.low})</ToggleButton>
        <ToggleButton
          selected={true}
          disabled={countBySeverity.success === 0}
          icon={faCheckSquare}
          iconClass="text-[var(--pd-state-success)]"
          on:click={event => onSeverityClicked('success', event.detail)}
          >Passed ({countBySeverity.success})</ToggleButton>
      </ToggleButtonGroup>
    </div>
  </div>
  <div class="h-full flex flex-row space-x-8">
    <div class="h-full overflow-y-auto w-1/3">
      {#each providers as provider}
        <div role="row" class="rounded-lg bg-[var(--pd-content-bg)] mb-4 p-4 flex flex-col">
          <div class="flex flex-row items-center">
            <span class="grow">{provider.info.label}</span>
            {#if provider.state === 'running'}
              <Spinner size="12"></Spinner>
            {/if}
            {#if provider.state === 'failed'}
              <span class="text-[var(--pd-state-error)] mt-1">
                <Fa size="1.1x" icon={faExclamationTriangle} />
              </span>
            {/if}
            {#if provider.state === 'canceled'}
              <span class="text-[var(--pd-modal-text)]">
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
            <div class="text-[var(--pd-state-error)] text-sm">{provider.error}</div>
          {/if}
          {#if provider.state === 'canceled'}
            <div class="text-[var(--pd-content-text)] text-sm">Canceled by user</div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="h-full w-full pr-4 overflow-y-scroll pb-16">
      {#each filtered as result}
        <div
          role="row"
          class="rounded-r-lg bg-[var(--pd-content-bg)] mb-4 mr-4 p-4 border-l-2"
          class:border-l-[var(--pd-state-error)]={result.check.severity === 'critical'}
          class:border-l-[var(--pd-state-warning)]={result.check.severity === 'high'}
          class:border-l-[var(--pd-severity-medium)]={result.check.severity === 'medium'}
          class:border-l-[var(--pd-severity-low)]={result.check.severity === 'low'}
          class:border-l-[var(--pd-state-success)]={result.check.status === 'success'}>
          <div class="flex flex-row space-x-2">
            <span
              class:text-[var(--pd-state-error)]={result.check.severity === 'critical'}
              class:text-[var(--pd-state-warning)]={result.check.severity === 'high'}
              class:text-[var(--pd-severity-medium)]={result.check.severity === 'medium'}
              class:text-[var(--pd-severity-low)]={result.check.severity === 'low'}
              class:text-[var(--pd-state-success)]={result.check.status === 'success'}
              ><Fa size="1.1x" class="mt-1" icon={getIcon(result.check)} />
            </span>
            <div class="font-bold">{result.check.name}</div>
            <div class="text-[var(--pd-content-text)] text-sm grow text-right">Reported by {result.provider.label}</div>
          </div>
          {#if result.check.markdownDescription}
            <div class="mt-4">{result.check.markdownDescription}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
