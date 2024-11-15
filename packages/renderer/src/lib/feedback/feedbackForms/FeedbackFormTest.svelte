<script lang="ts">
import FeedbackForm from '../FeedbackForm.svelte';
</script>
  
  <FeedbackForm>
    <p slot="content" aria-label="content">Content</p>
  
    <p slot="validation" aria-label="validation">Validation</p>
  
    <p slot="buttons" aria-label="buttons">Buttons</p>
  </FeedbackForm>
