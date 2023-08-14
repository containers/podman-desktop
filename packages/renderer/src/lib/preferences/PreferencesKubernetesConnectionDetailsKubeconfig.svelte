<script lang="ts">
import MonacoEditor from '../editor/MonacoEditor.svelte';

export let kubeconfig: string;
</script>

{#if kubeconfig}
  <MonacoEditor content="{kubeconfig}" language="yaml" />
{/if}
