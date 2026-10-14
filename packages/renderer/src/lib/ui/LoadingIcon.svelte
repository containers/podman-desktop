<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Component } from 'svelte';
import type { IconSize } from 'svelte-fa';

interface Props {
  icon: IconDefinition | Component | string;
  loadingWidthClass?: string;
  loadingHeightClass?: string;
  loading?: boolean;
  iconSize?: IconSize;
}

let {
  icon,
  loadingWidthClass = 'w-6',
  loadingHeightClass = 'h-6',
  loading = false,
  iconSize = undefined,
}: Props = $props();
</script>

<div>
  <Icon size={iconSize} icon={icon} />
  <div
    aria-label="spinner"
    class="{loading
      ? ''
      : 'hidden'} {loadingWidthClass} {loadingHeightClass} rounded-full animate-spin -translate-1/2 border border-solid border-[var(--pd-button-spinner)] border-t-transparent absolute left-1/2 top-1/2">
  </div>
</div>
