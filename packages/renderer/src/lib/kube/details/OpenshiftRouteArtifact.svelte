<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';
import type { V1Route } from '/@api/openshift-types';

// Assuming V1Route type is imported or defined elsewhere
export let artifact: V1Route | undefined;
</script>

{#if artifact}
  <tr>
    <Title>Details</Title>
  </tr>
  {#if artifact.spec?.host}
    <tr>
      <Cell>Host</Cell>
      <Cell>
        {artifact.spec.host}
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.path}
    <tr>
      <Cell>Path</Cell>
      <Cell>
        {artifact.spec.path ?? 'N/A'}
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.port}
    <tr>
      <Cell>Port</Cell>
      <Cell>
        {artifact.spec.port ? artifact.spec.port.targetPort : 'N/A'}
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.tls}
    <tr>
      <Cell>TLS</Cell>
      <Cell>
        Termination: {artifact.spec.tls.termination} • Insecure Edge Policy: {artifact.spec.tls
          .insecureEdgeTerminationPolicy}
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.wildcardPolicy}
    <tr>
      <Cell>Wildcard Policy</Cell>
      <Cell>
        {artifact.spec.wildcardPolicy}
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.to}
    <tr>
      <Cell>Backend</Cell>
      <Cell>
        {artifact.spec.to.kind} / {artifact.spec.to.name} (Weight: {artifact.spec.to.weight})
      </Cell>
    </tr>
  {/if}
  {#if artifact.spec?.host}
    <tr>
      <Cell>Link</Cell>
      <Cell>
        {@const link = `${artifact.spec.tls ? 'https' : 'http'}://${artifact.spec.host}${artifact.spec.path ?? ''}`}
        <Link on:click={() => window.openExternal(link)}>
          {link}
        </Link>
      </Cell>
    </tr>
  {/if}
{/if}
