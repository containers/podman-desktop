<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Fa, type IconSize } from 'svelte-fa';

export let icon: IconDefinition;
export let loadingWidthClass: string;
export let loadingHeightClass: string;
export let positionTopClass: string;
export let positionLeftClass: string;
export let loading = false;
export let iconSize: IconSize | undefined = undefined;
</script>

<div>
  <Fa size={iconSize} icon={icon} />
  <div
    aria-label="spinner"
    class="{loading
      ? ''
      : 'hidden'} {loadingWidthClass} {loadingHeightClass} rounded-full animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent absolute {positionTopClass} {positionLeftClass}">
  </div>
</div>
