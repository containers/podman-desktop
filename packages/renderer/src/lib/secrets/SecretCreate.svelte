<script lang="ts">
import { NavigationPage, type ProviderContainerConnectionInfo, type SecretCreateOptions } from '@desktop-framework/api';
import { Button, ButtonRow, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import SecretIcon from '/@/lib/images/SecretIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { handleNavigation } from '/@/navigation';
import { providerInfos } from '/@/stores/providers';

let createError: string | undefined = $state(undefined);
let loading = $state(false);

let secretCreateOptions: SecretCreateOptions & { provider?: ProviderContainerConnectionInfo } = $state({
  provider: undefined,
  name: '',
  data: '',
});

let providerConnections = $derived(
  $providerInfos.reduce<ProviderContainerConnectionInfo[]>((acc, provider) => {
    const startedConnections = provider.containerConnections.filter(connection => connection.status === 'started');
    return acc.concat(startedConnections);
  }, []),
);

$effect(() => {
  if (providerConnections.length > 0 && secretCreateOptions.provider === undefined) {
    secretCreateOptions.provider = providerConnections[0];
  }
});

let valid = $derived(
  secretCreateOptions.provider !== undefined &&
    secretCreateOptions.name.trim().length > 0 &&
    secretCreateOptions.data.length > 0,
);

async function createSecret(): Promise<void> {
  if (!secretCreateOptions.provider) return;

  try {
    loading = true;
    createError = undefined;
    await window.createSecret($state.snapshot(secretCreateOptions));
    handleNavigation({ page: NavigationPage.SECRETS });
  } catch (error: unknown) {
    createError = error instanceof Error ? error.message : String(error);
  } finally {
    loading = false;
  }
}

function close(): void {
  handleNavigation({ page: NavigationPage.SECRETS });
}
</script>

<EngineFormPage title="Create a secret" showEmptyScreen={providerConnections.length === 0}>
  {#snippet icon()}
    <Icon icon={SecretIcon} size={27} />
  {/snippet}
  {#snippet content()}
    <div class="space-y-6">
      {#if providerConnections.length > 1}
        <div>
          <label for="providerChoice" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
            >Container Engine <span class="text-(--pd-state-error)">*</span></label>
          <ContainerConnectionDropdown
            id="providerChoice"
            name="providerChoice"
            bind:value={secretCreateOptions.provider}
            connections={providerConnections} />
        </div>
      {/if}

      <div>
        <label for="secretName" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Name <span class="text-(--pd-state-error)">*</span></label>
        <Input
          bind:value={secretCreateOptions.name}
          name="secretName"
          id="secretName"
          placeholder="Secret name"
          required
          class="w-full" />
      </div>

      <div>
        <label for="secretData" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
          >Data <span class="text-(--pd-state-error)">*</span></label>
        <Input
          bind:value={secretCreateOptions.data}
          name="secretData"
          id="secretData"
          type="password"
          placeholder="Secret data"
          required
          class="w-full" />
      </div>

      <ButtonRow>
        <Button type="secondary" onclick={close}>Cancel</Button>
        <Button disabled={!valid || loading} inProgress={loading} onclick={createSecret}>Create</Button>
      </ButtonRow>

      {#if createError}
        <ErrorMessage class="text-sm" error={createError} />
      {/if}
    </div>
  {/snippet}
</EngineFormPage>
