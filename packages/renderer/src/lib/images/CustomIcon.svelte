<script lang="ts">
export let altText: string;
export let icon: string | { light: string; dark: string };
export let classes = '';
</script>

{#if icon}
  {#if typeof icon === 'string'}
    <img src="{icon}" alt="{altText}" class="{classes}" />
  {:else}
    <img src="{icon.dark}" alt="{altText}" class="{classes}" />
  {/if}
{/if}
