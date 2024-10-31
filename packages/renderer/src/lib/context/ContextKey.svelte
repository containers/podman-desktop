<script lang="ts">
import { onMount } from 'svelte';

import { initContextKeysPlatform } from './contextKey';

onMount(async () => {
  // initialize context keys value
  await initContextKeysPlatform();
});
</script>
