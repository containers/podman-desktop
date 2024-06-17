<script lang="ts">
import type { ContextUI } from '/@/lib/context/context';
import When from '/@/lib/context/When.svelte';

export let expression: string | undefined = '';
export let contextUI: ContextUI | undefined = undefined;
export let fallback: boolean = false;
</script>

<When fallback="{fallback}" contextUI="{contextUI}" expression="{expression}" let:result>
  <span role="status" class:enabled="{result}">{result}</span>
</When>
