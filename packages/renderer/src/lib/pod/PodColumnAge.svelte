<script lang="ts">
import StateChange from '../ui/StateChange.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<div class="text-sm text-[var(--pd-table-body-text)]">
  <StateChange state="{object.status}">{object.age}</StateChange>
</div>
