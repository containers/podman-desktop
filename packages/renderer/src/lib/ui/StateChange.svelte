<script lang="ts">
export let state: string;
</script>

{#if state === 'STARTING'}Starting...{:else if state === 'STOPPING'}Stopping...{:else if state === 'DELETING'}Deleting...{:else}
  <slot />
{/if}
