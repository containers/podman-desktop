<script lang="ts">
import { router } from 'tinro';

import { ConfigMapSecretUtils } from './configmap-secret-utils';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;

function openDetails() {
  const configmapSecretUtils = new ConfigMapSecretUtils();
  if (configmapSecretUtils.isSecret(object)) {
    router.goto(`/configmapsSecrets/secret/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
  }

  if (configmapSecretUtils.isConfigMap(object)) {
    router.goto(`/configmapsSecrets/configmap/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
  }
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetails()}>
  <div class="text-sm text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
