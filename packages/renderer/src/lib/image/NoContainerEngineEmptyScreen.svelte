<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
</script>

<div class="h-full min-w-full flex flex-col">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <i class="fas fa-layer-group pf-c-empty-state__icon" aria-hidden="true"></i>

      <h1 class="pf-c-title pf-m-lg">No Container Engine</h1>
      <div class="pf-c-empty-state__body">Configure/Start a container engine first</div>
    </div>
  </div>
</div>
