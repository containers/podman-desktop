<script lang="ts">
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import KubernetesIcon from './KubernetesIcon.svelte';

interface Props {
  type: string;
  activeCount?: number;
  count: number;
  kind: string;
  permitted: boolean;
}

let { type, activeCount, count, kind, permitted }: Props = $props();

async function openLink(): Promise<void> {
  try {
    await window.navigateToRoute('kubernetes', { kind: kind });
  } finally {
    await window.telemetryTrack('kubernetes.dashboard.resource', { type: type, kind: kind });
  }
}
</script>

<button class="flex flex-col gap-4 p-4 bg-[var(--pd-content-card-carousel-card-bg)] hover:bg-[var(--pd-content-card-carousel-card-hover-bg)] rounded-md" class:opacity-60={!permitted} onclick={openLink}>
  <div class="text-start flex">
    <span class="text-[var(--pd-invert-content-card-text)] font-semibold grow">{type}</span>
    {#if !permitted}
      <span class="ml-1"><Tooltip bottom={true} class="" tip={`${type} are not accessible`}><div><Icon size="1x" icon={faQuestionCircle} /></div></Tooltip></span>
    {/if}
  </div>
  <div class="grid grid-cols-{activeCount !== undefined ? '3' : '2'} gap-4 w-full grow items-end">
    <div class="justify-self-center text-(--pd-button-icon-primary-text)"><KubernetesIcon kind={kind} size="40"/></div>
    {#if activeCount !== undefined}
    <div class="flex flex-col">
      <span class="text-[var(--pd-invert-content-card-text)]">Active</span>
      <div class="text-2xl text-[var(--pd-invert-content-card-text)]" aria-label="{type} active count">{#if permitted}{activeCount}{:else}-{/if}</div>
    </div>
    {/if}
    <div class="flex flex-col">
      <span class="text-[var(--pd-invert-content-card-text)]">Total</span>
      <div class="text-2xl text-[var(--pd-invert-content-card-text)]" aria-label="{type} count">{#if permitted}{count}{:else}-{/if}</div>
    </div>
  </div>
</button>
