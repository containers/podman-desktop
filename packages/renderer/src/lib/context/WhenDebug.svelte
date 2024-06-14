<script lang="ts">
import type { ContextUI } from '/@/lib/context/context';
import When from '/@/lib/context/When.svelte';

export let expression: string | undefined = '';
export let contextUI: ContextUI | undefined = undefined;
</script>

<When contextUI="{contextUI}" expression="{expression}" let:enabled>
  <span role="status" class:enabled="{enabled}">{enabled}</span>
</When>
