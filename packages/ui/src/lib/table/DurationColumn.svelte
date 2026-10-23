<script lang="ts">
import humanizeDuration from 'humanize-duration';

import { DurationRefresher } from './duration-refresher';
import SimpleColumn from './SimpleColumn.svelte';

interface Props {
  object?: Date;
}

let { object }: Props = $props();

let now: number = $state(Date.now());
let hasPreviousObject = false;
let previousObject: Date | undefined;

let duration: string = $derived(object ? humanizeDuration(now - object.getTime(), { round: true, largest: 1 }) : '');

$effect(() => {
  if (hasPreviousObject && previousObject !== object) {
    now = Date.now();
  }
  hasPreviousObject = true;
  previousObject = object;
  if (!object) {
    return;
  }
  const refresher = new DurationRefresher();
  refresher.start(object.getTime(), (current: number): void => {
    now = current;
  });
  return (): void => refresher.stop();
});
</script>

<SimpleColumn object={duration} />
