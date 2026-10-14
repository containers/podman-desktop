<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';

import type { ILoadingStatus } from '/@/lib/preferences/Util';

import LoadingIcon from './LoadingIcon.svelte';
import { capitalize } from './Util';

interface Props {
  action: string;
  icon: IconDefinition;
  state?: ILoadingStatus;
  color?: 'primary' | 'secondary';
  tooltip?: string;
  clickAction: () => Promise<void> | void;
}

const { action, icon, state, color = 'secondary', tooltip = capitalize(action), clickAction }: Props = $props();

const disable = $derived.by(() => {
  if (state?.inProgress || state?.status === 'unsupported') {
    return true;
  }

  switch (action) {
    case 'start':
      return state?.status !== 'stopped' && state?.status !== 'failed';
    case 'restart':
      return state?.status !== 'started';
    case 'stop':
      return state?.status !== 'started' && state?.status !== 'starting';
    case 'delete':
      return state?.status !== 'failed' && state?.status !== 'stopped' && state?.status !== 'unknown';
    case 'update':
      return state?.status === 'unknown';
    case 'edit':
      return state?.status !== 'started' && state?.status !== 'stopped';
  }
});

const loading = $derived(state?.inProgress && action === state?.action);

const style = $derived(
  disable
    ? 'text-[var(--pd-button-icon-disabled-text)] cursor-not-allowed'
    : color === 'secondary'
      ? 'text-[var(--pd-button-icon-text)] hover:text-[var(--pd-button-icon-hover-text)]'
      : 'text-[var(--pd-button-icon-primary-text)] hover:text-[var(--pd-button-icon-primary-hover-text)]',
);
</script>

<Tooltip bottom tip={tooltip}>
  <button aria-label={capitalize(action)} class="px-2.5 py-2 {style}" onclick={clickAction} disabled={disable}>
    <LoadingIcon
      icon={icon}
      loading={loading} />
  </button>
</Tooltip>
