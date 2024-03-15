<script lang="ts">
import StateChange from '../ui/StateChange.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<div class="text-sm text-gray-700">
  <StateChange state="{object.status}">{object.age}</StateChange>
</div>
