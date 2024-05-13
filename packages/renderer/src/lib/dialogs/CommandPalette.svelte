<script lang="ts">
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'F1') {
    window.showCommandPalette();
    e.preventDefault();
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />
