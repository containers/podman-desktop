<script lang="ts">
import type { PodInfoUI } from './PodInfoUI';
import StateChange from '../ui/StateChange.svelte';

export let object: PodInfoUI;
</script>

<div class="text-sm text-gray-700">
  <StateChange state="{object.status}">{object.age}</StateChange>
</div>
