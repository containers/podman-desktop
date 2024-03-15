<script lang="ts">
import { onMount } from 'svelte';

import { initContextKeysPlatform } from './contextKey';

onMount(() => {
  // initialize context keys value
  initContextKeysPlatform();
});
</script>
