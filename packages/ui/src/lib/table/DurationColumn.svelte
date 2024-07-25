<script lang="ts">
import humanizeDuration from 'humanize-duration';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';

import SimpleColumn from './SimpleColumn.svelte';

export let object: Date | undefined;
let duration: string = '';
let refreshTimeouts: number[] = [];

export function computeInterval(uptimeInMs: number): number {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  // if less than a minute, refresh every 2s
  if (uptimeInMs < MINUTE - 2 * SECOND) {
    return 2 * SECOND;
  }

  // if less than an hour, refresh on the next minute
  if (uptimeInMs < HOUR) {
    return Math.ceil((uptimeInMs + 1) / MINUTE) * MINUTE - uptimeInMs;
  }

  // if less than a day, refresh on the next hour
  if (uptimeInMs < DAY) {
    return Math.ceil((uptimeInMs + 1) / HOUR) * HOUR - uptimeInMs;
  }

  // otherwise, refresh on the day
  return Math.ceil((uptimeInMs + 1) / DAY) * DAY - uptimeInMs;
}

function refreshDuration(): void {
  if (!object) {
    duration = '';
    return;
  }

  // get start time in ms
  const uptimeInMs = moment().diff(object);

  duration = humanizeDuration(uptimeInMs, { round: true, largest: 1 });

  // compute next refresh
  const interval = computeInterval(uptimeInMs);
  refreshTimeouts.forEach(timeout => window.clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(window.setTimeout(refreshDuration, interval));
}

onMount(async () => {
  refreshDuration();
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => window.clearTimeout(timeout));
  refreshTimeouts.length = 0;
});
</script>

<SimpleColumn object={duration} />
