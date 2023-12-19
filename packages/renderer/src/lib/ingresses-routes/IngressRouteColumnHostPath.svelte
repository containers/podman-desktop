<script lang="ts">
import Link from '../ui/Link.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;
</script>

{#if 'rules' in object && object.rules}
  {#each object.rules as rule}
    {@const host = rule.host ?? ''}
    {#if rule.http}
      {#each rule.http.paths as path}
        {#if path.path}
          {#if host}
            <div class="text-sm text-gray-300">
              <Link externalRef="https://{host}{path.path}">
                {host}{path.path}
              </Link>
            </div>
          {:else}
            <div class="text-sm text-gray-300">{host}{path.path}</div>
          {/if}
        {/if}
      {/each}
    {/if}
  {/each}
{/if}
