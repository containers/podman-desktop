<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<EmptyScreen title="No Container Engine" message="Configure/Start a container engine first">
  <span slot="icon"><i class="fas fa-layer-group pf-c-empty-state__icon" aria-hidden="true"></i></span>
</EmptyScreen>
