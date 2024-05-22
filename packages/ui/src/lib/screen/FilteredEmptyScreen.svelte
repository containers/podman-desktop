<script lang="ts">
import { createEventDispatcher } from 'svelte';

import Button from '../button/Button.svelte';
import EmptyScreen from './EmptyScreen.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any;
export let kind: string;
export let searchTerm: string;

const dispatch = createEventDispatcher();
function onResetFilter(): void {
  if (dispatch('resetFilter', searchTerm, { cancelable: true })) {
    searchTerm = '';
  }
}

$: filter = searchTerm && searchTerm.length > 20 ? 'filter' : `'${searchTerm}'`;
</script>

<EmptyScreen
  icon="{icon}"
  title="No {kind} matching {filter} found"
  message="Not what you expected? Double-check your spelling."
  detail="Just want to view all of your {kind}?">
  <Button on:click="{onResetFilter}">Clear filter</Button>
</EmptyScreen>
