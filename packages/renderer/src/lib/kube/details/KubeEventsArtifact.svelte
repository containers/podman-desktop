<script lang="ts">
import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';
import type { EventUI } from '/@/lib/events/EventUI';
import EventsTable from '/@/lib/kube/details/EventsTable.svelte';

interface Props {
  events: EventUI[];
}

let { events }: Props = $props();
</script>

<tr>
  <Title>Events</Title>
</tr>
{#if events?.length}
  <EventsTable events={events} />
{:else}
  <tr><Cell>No events</Cell></tr>
{/if}
