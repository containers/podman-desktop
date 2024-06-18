<script lang="ts">
import Label from './Label.svelte';

export let name = '';
export let tip = '';
export let slot = '';
export let role: string | undefined = undefined;
</script>

<Label tip="{tip}" role="{role}" name="{name}">{slot}</Label>
