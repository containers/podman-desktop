<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import Button from '../ui/Button.svelte';
import { createEventDispatcher } from 'svelte';
export let icon: any;
export let kind: string;
export let searchTerm: string;

const dispatch = createEventDispatcher();
function onResetFilter() {
  dispatch('resetFilter');
}

$: filter = searchTerm && searchTerm.length > 20 ? 'filter' : `'${searchTerm}'`;
</script>

<EmptyScreen
  icon="{icon}"
  title="No {kind} matching {filter} found"
  message="Not what you expected? Double-check your spelling."
  detail="Just want to view all of your {kind}?">
  <Button on:click="{() => onResetFilter()}">Clear filter</Button>
</EmptyScreen>
