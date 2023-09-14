<script lang="ts">
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import { stringify } from 'yaml';
import type { V1Pod } from '@kubernetes/client-node';
export let pod: V1Pod;
let kubeDetails: string = stringify(pod);
</script>

{#if kubeDetails}
  <MonacoEditor content="{kubeDetails}" language="yaml" />
{/if}
