<script lang="ts">
import type { CheckStatus, Menu, ProviderInfo } from '@desktop-framework/api';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { router } from 'tinro';

import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';
import type { ContextUI } from '/@/lib/context/context';
import { ContextUI as ContextUIImpl } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import ProviderUpdateButton from '/@/lib/dashboard/ProviderUpdateButton.svelte';

interface Props {
  provider: ProviderInfo;
  contributions?: Menu[];
  globalContext: ContextUI | undefined;
  providerInstallationInProgress: boolean;
  onCreateNew: (provider: ProviderInfo, displayName: string) => Promise<void>;
  onUpdatePreflightChecks: (checks: CheckStatus[]) => void;
  isOnboardingEnabled: (provider: ProviderInfo, context: ContextUI) => boolean;
  hasAnyConfiguration: (provider: ProviderInfo) => boolean;
  class?: string;
}

let {
  provider,
  contributions = [],
  globalContext,
  providerInstallationInProgress,
  onCreateNew,
  onUpdatePreflightChecks,
  isOnboardingEnabled,
  hasAnyConfiguration,
  class: className = '',
}: Props = $props();

const isOnboarding = $derived(globalContext && isOnboardingEnabled(provider, globalContext));

const showOnboardingSetup = $derived(
  isOnboarding && (provider.status === 'not-installed' || provider.status === 'unknown'),
);

const providerDisplayName = $derived(
  (provider.containerProviderConnectionCreation
    ? (provider.containerProviderConnectionCreationDisplayName ?? undefined)
    : provider.kubernetesProviderConnectionCreation
      ? provider.kubernetesProviderConnectionCreationDisplayName
      : provider.vmProviderConnectionCreation
        ? provider.vmProviderConnectionCreationDisplayName
        : undefined) ?? provider.name,
);

const buttonTitle = $derived(
  (provider.containerProviderConnectionCreation
    ? (provider.containerProviderConnectionCreationButtonTitle ?? undefined)
    : provider.kubernetesProviderConnectionCreation
      ? provider.kubernetesProviderConnectionCreationButtonTitle
      : provider.vmProviderConnectionCreation
        ? provider.vmProviderConnectionCreationButtonTitle
        : undefined) ?? 'Create new',
);

const hasConnectionFactory = $derived(
  provider.containerProviderConnectionCreation ||
    provider.kubernetesProviderConnectionCreation ||
    provider.vmProviderConnectionCreation,
);

const hasWarnings = $derived(provider.warnings && provider.warnings.length > 0);

const warningsTooltip = $derived(provider.warnings?.map(w => w.details ?? w.name).join('. ') ?? '');

const showCreateNewButton = $derived(hasConnectionFactory || hasWarnings);

const isCreateButtonDisabled = $derived(!hasConnectionFactory && hasWarnings);

const showSetupButton = $derived(
  globalContext && (isOnboardingEnabled(provider, globalContext) || hasAnyConfiguration(provider)),
);

const showUpdateButton = $derived(
  provider.version && provider.updateInfo?.version && provider.version !== provider.updateInfo?.version,
);

const DISABLED = 'disabled';
const WHEN = 'when';

const providerContext = $derived(createProviderContext(provider, globalContext));
const visibleProviderMenus = $derived(contributions.filter(menu => isProviderMenu(WHEN, menu)));

function handleCreateNew(): Promise<void> {
  return onCreateNew(provider, providerDisplayName);
}

function handleSetup(): void {
  if (isOnboarding) {
    router.goto(`/preferences/onboarding/${provider.extensionId}`);
  } else {
    router.goto(`/preferences/default/preferences.${provider.extensionId}`);
  }
}

function createProviderContext(provider: ProviderInfo, globalContext: ContextUI | undefined): ContextUI {
  const providerContext = new ContextUIImpl();
  for (const [key, value] of Object.entries(globalContext?.value ?? {})) {
    providerContext.setValue(key, value);
  }
  providerContext.setValue('providerId', provider.id);
  providerContext.setValue('providerName', provider.name);
  providerContext.setValue('providerStatus', provider.status);
  providerContext.setValue('providerExtensionId', provider.extensionId);
  return providerContext;
}

function isProviderMenu(option: typeof WHEN | typeof DISABLED, menu: Menu): boolean {
  if (!menu[option]) {
    return option === WHEN;
  }
  return ContextKeyExpr.deserialize(menu[option])?.evaluate(providerContext) ?? false;
}

function executeProviderMenu(menu: Menu): void {
  window.executeCommand(menu.command, removeNonSerializableProperties(provider)).catch(err => {
    console.error(`Error while executing ${menu.title}: ${String(err)}`);
  });
}
</script>

<div class="text-center mt-10 {className}">
  {#if showOnboardingSetup}
    <Button
      aria-label="Set up {provider.name}"
      title="Set up {provider.name}"
      onclick={handleSetup}>
      Set up...
    </Button>
  {:else}
    <div class="flex flex-row justify-around flex-wrap gap-2">
      {#if showCreateNewButton}
        <Tooltip bottom tip={isCreateButtonDisabled ? warningsTooltip : `Create new ${providerDisplayName}`}>
          <Button
            aria-label="Create new {providerDisplayName}"
            inProgress={providerInstallationInProgress}
            disabled={isCreateButtonDisabled}
            onclick={handleCreateNew}>
            {buttonTitle}...
          </Button>
        </Tooltip>
      {/if}

      {#if showSetupButton}
        <Button
          aria-label="Set up {provider.name}"
          title="Set up {provider.name}"
          onclick={handleSetup}>
          <Icon size="0.9x" icon={faGear} />
        </Button>
      {/if}

      {#if showUpdateButton}
        <ProviderUpdateButton
          onPreflightChecks={onUpdatePreflightChecks}
          provider={provider} />
      {/if}

      {#each visibleProviderMenus as menu, index (index)}
        <Button
          aria-label={menu.title}
          title={menu.title}
          icon={menu.icon}
          disabled={isProviderMenu(DISABLED, menu)}
          onclick={(): void => executeProviderMenu(menu)}>
          {menu.title}
        </Button>
      {/each}
    </div>
  {/if}
</div>
