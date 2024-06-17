<script lang="ts">
import Label from './Label.svelte';

export let name = '';
export let tip = '';
export let slot = '';
</script>

<Label tip="{tip}" name="{name}">{slot}</Label>
