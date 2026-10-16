<!-- force the component to be legacy mode -->
<svelte:options runes={false} />
<script lang="ts">
import { Button } from '/@/lib';

export let onclick: () => void;
export let content: string | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any | undefined;
export let disabled = false;
</script>

<Button on:click={onclick} icon={icon} disabled={disabled}>
  {content}
</Button>
