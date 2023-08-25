<script lang="ts">
export let altText: string | undefined = '';
export let icon: string | { light: string; dark: string } | undefined;
export let classes = '';
</script>

{#if icon}
  {#if typeof icon === 'string'}
    <img src="{icon}" alt="{altText}" class="{classes}" />
  {:else}
    <img src="{icon.dark}" alt="{altText}" class="{classes}" />
  {/if}
{/if}
