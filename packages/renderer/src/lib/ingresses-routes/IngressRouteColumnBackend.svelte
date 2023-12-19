<script lang="ts">
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;
</script>

{#if 'rules' in object && object.rules}
  {#each object.rules as rule}
    {#if rule.http}
      {#each rule.http.paths as path}
        {#if path.backend.service}
          <div class="text-sm text-gray-300">{path.backend.service.name}:{path.backend.service.port?.number ?? ''}</div>
        {:else if path.backend.resource}
          <div class="text-sm text-gray-300">{path.backend.resource.kind} {path.backend.resource.name}</div>
        {/if}
      {/each}
    {/if}
  {/each}
{/if}
