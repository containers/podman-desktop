<script lang="ts">
import type { V1IngressSpec } from '@kubernetes/client-node';
import { Link } from '@podman-desktop/ui-svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

// Props for Ingress artifact and Status
export let artifact: V1IngressSpec | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>

  {#if artifact.defaultBackend}
    {#if artifact.defaultBackend.service}
      <tr>
        <Cell>Default Backend Service</Cell>
        <Cell
          >{artifact.defaultBackend.service?.name}
          {#if artifact.defaultBackend.service?.port?.number}
            :{artifact.defaultBackend.service?.port?.number}
          {/if}
          {#if artifact.defaultBackend.service?.port?.name}
            ({artifact.defaultBackend.service?.port?.name})
          {/if}
        </Cell>
      </tr>
    {/if}
    {#if artifact.defaultBackend.resource}
      <tr>
        <Cell>Default Backend Resource</Cell>
        <Cell>{artifact.defaultBackend.resource.name} ({artifact.defaultBackend.resource.kind})</Cell>
      </tr>
    {/if}
  {/if}

  {#if artifact.tls}
    <tr>
      <Title>TLS</Title>
    </tr>
    {#each artifact.tls as tls}
      <tr>
        <Cell>Secret Name</Cell>
        <Cell>{tls.secretName}</Cell>
      </tr>
      {#if tls.hosts}
        <tr>
          <Cell>Hosts</Cell>
          <Cell>{tls.hosts.join(', ')}</Cell>
        </tr>
      {/if}
    {/each}
  {/if}

  {#if artifact.rules}
    <tr>
      <Cell>Rules</Cell>
      <Cell>
        {#each artifact.rules || [] as rule}
          <!-- Here we use || [] to ensure it's always an array -->
          {#if rule.http}
            {#each rule.http.paths as path}
              Path: {path.path}
              {#if rule.host}
                • Link:
                {@const link = `${artifact.tls && artifact.tls.length > 0 ? 'https' : 'http'}://${rule.host}${path.path}`}
                <Link on:click={() => window.openExternal(link)}>
                  {link}
                </Link>
              {/if}
              {#if path.backend.service}
                • Backend: {path.backend.service?.name}{path.backend.service?.port?.number ? ':' : ''}{path.backend
                  .service?.port?.number}
              {:else if path.backend.resource}
                • Backend: {path.backend.resource?.name}
              {/if}
            {/each}
          {/if}
        {/each}
      </Cell>
    </tr>{/if}
{/if}
