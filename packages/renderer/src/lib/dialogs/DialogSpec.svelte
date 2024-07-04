<script lang="ts">
import Dialog from './Dialog.svelte';
</script>

<Dialog title="Test dialog">
  <i slot="icon" aria-label="icon">Icon</i>

  <i slot="content" aria-label="content">Content</i>

  <i slot="validation" aria-label="validation">Validation</i>

  <i slot="buttons" aria-label="buttons">Buttons</i>
</Dialog>
