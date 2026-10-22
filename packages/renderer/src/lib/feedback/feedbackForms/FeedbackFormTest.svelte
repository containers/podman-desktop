<script lang="ts">
import FeedbackForm from '/@/lib/feedback/FeedbackForm.svelte';
</script>

<FeedbackForm>
  {#snippet content()}
    <p aria-label="content">Content</p>
  {/snippet}
  {#snippet validation()}
    <p aria-label="validation">Validation</p>
  {/snippet}
  {#snippet buttons()}
    <p aria-label="buttons">Buttons</p>
  {/snippet}
</FeedbackForm>
