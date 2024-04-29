<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import type { ILoadingStatus } from '../preferences/Util';
import LoadingIcon from './LoadingIcon.svelte';
import Tooltip from './Tooltip.svelte';
import { capitalize } from './Util';

export let action: string;
export let icon: IconDefinition;
export let state: ILoadingStatus | undefined;
export let leftPosition: string;
export let color: 'primary' | 'secondary' = 'secondary';
export let tooltip: string = capitalize(action);
export let clickAction: () => Promise<void> | void;

let disable: boolean;
$: {
  if (state?.inProgress || state?.status === 'unsupported') {
    disable = true;
  } else {
    switch (action) {
      case 'start':
        disable = state?.status !== 'stopped' && state?.status !== 'failed';
        break;
      case 'restart':
        disable = state?.status !== 'started';
        break;
      case 'stop':
        disable = state?.status !== 'started';
        break;
      case 'delete':
        disable = state?.status !== 'failed' && state?.status !== 'stopped' && state?.status !== 'unknown';
        break;
      case 'update':
        disable = state?.status === 'unknown';
        break;
    }
  }
}

$: loading = state?.inProgress && action === state?.action;

$: style = disable
  ? 'text-gray-900 cursor-not-allowed'
  : color === 'secondary'
    ? 'text-white hover:text-gray-700'
    : 'text-purple-600 hover:text-purple-500';
</script>

<Tooltip tip="{tooltip}" bottom>
  <button aria-label="{capitalize(action)}" class="mx-2.5 my-2 {style}" on:click="{clickAction}" disabled="{disable}">
    <LoadingIcon
      icon="{icon}"
      loadingWidthClass="w-6"
      loadingHeightClass="h-6"
      positionTopClass="top-1"
      positionLeftClass="{leftPosition}"
      loading="{loading}" />
  </button>
</Tooltip>
