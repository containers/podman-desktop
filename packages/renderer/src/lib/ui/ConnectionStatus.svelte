<script lang="ts">
import humanizeDuration from 'humanize-duration';
import moment from 'moment';
import { onDestroy } from 'svelte';

interface Props {
  status: string;
  started?: number | Date | string;
}

let { status, started }: Props = $props();

interface ConnectionStatusStyle {
  bgColor: string;
  txtColor: string;
  label: string;
}

const roundIconStyle = 'my-auto w-3 h-3 rounded-full';
const labelStyle = 'my-auto ml-1 text-xs';
const statusesStyle = new Map<string, ConnectionStatusStyle>([
  [
    'started',
    {
      bgColor: 'bg-[var(--pd-status-running)]',
      txtColor: 'text-[var(--pd-status-running)]',
      label: 'RUNNING',
    },
  ],
  [
    'starting',
    {
      bgColor: 'bg-[var(--pd-status-starting)]',
      txtColor: 'text-[var(--pd-status-starting)]',
      label: 'STARTING',
    },
  ],
  [
    'stopped',
    {
      bgColor: 'bg-[var(--pd-status-stopped)]',
      txtColor: 'text-[var(--pd-status-stopped)]',
      label: 'OFF',
    },
  ],
  [
    'stopping',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'STOPPING',
    },
  ],
  [
    'failed',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'FAILED',
    },
  ],
]);
let statusStyle = $derived(
  statusesStyle.get(status) ?? {
    bgColor: 'bg-[var(--pd-status-unknown)]',
    txtColor: 'text-[var(--pd-status-unknown)]',
    label: status.toUpperCase(),
  },
);

let duration: string = $state('');
let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * Calculates the next refresh interval based on current uptime.
 *
 * @param uptimeInMs Current uptime in milliseconds
 * @returns Milliseconds until the next timer tick
 */
export function computeInterval(uptimeInMs: number): number {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  if (uptimeInMs < MINUTE - 2 * SECOND) {
    return 2 * SECOND;
  }
  if (uptimeInMs < HOUR) {
    return Math.ceil((uptimeInMs + 1) / MINUTE) * MINUTE - uptimeInMs;
  }
  if (uptimeInMs < DAY) {
    return Math.ceil((uptimeInMs + 1) / HOUR) * HOUR - uptimeInMs;
  }
  return Math.ceil((uptimeInMs + 1) / DAY) * DAY - uptimeInMs;
}

/** Updates the displayed uptime and schedules its next refresh when started. */
function refreshDuration(): void {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = undefined;
  }
  if (!started || status !== 'started') {
    duration = '';
    return;
  }
  const uptimeInMs = moment().diff(started);
  if (!Number.isFinite(uptimeInMs)) {
    duration = '';
    return;
  }
  if (uptimeInMs < 0) {
    duration = '';
    refreshTimeout = setTimeout(refreshDuration, Math.min(-uptimeInMs, 2_147_483_647));
    return;
  }
  duration = humanizeDuration(uptimeInMs, { largest: 1 });
  const interval = computeInterval(uptimeInMs);
  refreshTimeout = setTimeout(refreshDuration, interval);
}

$effect(() => {
  if (status === 'started' && started) {
    refreshDuration();
  } else {
    duration = '';
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = undefined;
    }
  }
});

onDestroy(() => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
});
</script>

<div aria-label="Connection Status Icon" class="{roundIconStyle} {statusStyle.bgColor}"></div>
<span aria-label="Connection Status Label" class="{labelStyle} {statusStyle.txtColor}">{statusStyle.label}</span>
{#if duration}
  <span aria-label="Connection Duration" class="{labelStyle} text-[var(--pd-content-sub-header)]">({duration})</span>
{/if}
