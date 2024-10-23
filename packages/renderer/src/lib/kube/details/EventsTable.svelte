<script lang="ts">
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import Table from '/@/lib/details/DetailsTable.svelte';
import type { EventUI } from '/@/lib/events/EventUI';

export let events: EventUI[];
</script>
  
  <tr>
    <td colspan="2">
      <Table>
        <tr>
          <th align="left">Type</th><th align="left">Reason</th><th align="left">Age</th><th align="left">From</th><th align="left">Message</th>
        </tr>
        {#each events as event}
          <tr>
            <td>{event.type}</td>
            <td>{event.reason}</td>
            <td>{humanizeDuration(moment().diff(event.lastTimestamp), { round: true, largest: 1 })}</td>
            <td>{event.reportingComponent}</td>
            <td>{event.message}</td>
          </tr>
        {/each}
      </Table>
    </td>
  </tr>
  