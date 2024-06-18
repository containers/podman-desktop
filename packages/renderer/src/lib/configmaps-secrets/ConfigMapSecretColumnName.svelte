<script lang="ts">
import { router } from 'tinro';

import { ConfigMapSecretUtils } from './configmap-secret-utils';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;

function openDetails() {
  const configmapSecretUtils = new ConfigMapSecretUtils();
  if (configmapSecretUtils.isSecret(object)) {
    router.goto(`/configmapsSecrets/secret/${encodeURI(object.name)}/${encodeURI(object.namespace)}/summary`);
  } else {
    router.goto(
      `/configmapsSecrets/configmap/${encodeURI((object as ConfigMapSecretUI).name)}/${encodeURI((object as ConfigMapSecretUI).namespace)}/summary`,
    );
  }
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click="{() => openDetails()}">
  <div class="text-sm text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
