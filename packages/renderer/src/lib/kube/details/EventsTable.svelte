<script lang="ts">
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { EventUI } from '../../events/EventUI';

interface Props {
  events: EventUI[];
}

let { events }: Props = $props();

let sortedEvents: EventUI[] = $derived(
  events.toSorted((ev1, ev2) => ((ev1.lastTimestamp ?? Date.now()) < (ev2.lastTimestamp ?? Date.now()) ? -1 : 1)),
);

function getAgeAndCount(event: EventUI): string {
  let result = `${humanizeDuration(moment().diff(event.lastTimestamp), { round: true, largest: 1 })}`;
  if ((event.count ?? 0) > 1) {
    result += ` (${event.count}x over ${humanizeDuration(moment().diff(event.firstTimestamp), { round: true, largest: 1 })})`;
  }
  return result;
}
</script>
    
<tr>
  <td colspan="2">
    <table class="w-full ml-2.5" aria-label="events">
      <tbody>
        <tr>
          <th align="left">Type</th><th align="left">Reason</th><th align="left">Age</th><th align="left">From</th><th align="left">Message</th>
        </tr>
        {#each sortedEvents as event}
          <tr>
            <td>{event.type}</td>
            <td>{event.reason}</td>
            <td>{getAgeAndCount(event)}</td>
            <td>{event.reportingComponent}</td>
            <td>{event.message}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </td>
</tr>
  