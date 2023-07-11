<script lang="ts">
import FormPage from './FormPage.svelte';
</script>

<FormPage title="Test component" showBreadcrumb="{false}">
  <span slot="icon">
    <i class="fas fa-lightbulb fa-2x" aria-label="icon"></i>
  </span>

  <span slot="actions">
    <i class="fas fa-lightbulb fa-2x" aria-label="actions"></i>
  </span>

  <div slot="content" class="flex flex-col">
    <i class="fas fa-lightbulb fa-2x" aria-label="content"></i>
  </div>
</FormPage>
