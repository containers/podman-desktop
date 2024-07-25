<style>
.bootstrap-color {
  --bs-primary: theme(colors.purple.500);
}
</style>

<script lang="ts">
import { Steps } from 'svelte-steps';

export let steps: any[];
export let current = 0;
</script>

<div class="bootstrap-color" data-testid="step-div">
  <Steps steps={steps} size="1.7rem" line="1px" current={current} clickable={false} />
</div>
