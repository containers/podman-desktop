<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let icon: IconDefinition;
export let loadingWidthClass: string;
export let loadingHeightClass: string;
export let positionTopClass: string;
export let positionLeftClass: string;
export let loading: boolean;
</script>

<div>
  <Fa icon="{icon}" />
  <div
    aria-label="spinner"
    class="{loading
      ? ''
      : 'hidden'} {loadingWidthClass} {loadingHeightClass} rounded-full animate-spin border border-solid border-violet-500 border-t-transparent absolute {positionTopClass} {positionLeftClass}">
  </div>
</div>
