<script lang="ts">
import Label from './Label.svelte';

export let name = '';
export let tip = '';
export let slot = '';
export let role: string | undefined = undefined;
export let capitalize: boolean = false;
</script>

<Label tip={tip} role={role} name={name} capitalize={capitalize}>{slot}</Label>
