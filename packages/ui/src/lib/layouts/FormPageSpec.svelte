<script lang="ts">
import FormPage from './FormPage.svelte';
</script>

<FormPage title="Test component" showBreadcrumb={false}>
  <i slot="icon" class="fas fa-lightbulb fa-2x" aria-label="icon"></i>

  <i slot="actions" class="fas fa-lightbulb fa-2x" aria-label="actions"></i>

  <div slot="content" class="flex flex-col">
    <i class="fas fa-lightbulb fa-2x" aria-label="content"></i>
  </div>
</FormPage>
