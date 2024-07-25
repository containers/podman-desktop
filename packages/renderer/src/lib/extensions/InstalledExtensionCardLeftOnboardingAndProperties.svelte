<script lang="ts">
import { faFilePen, faGear } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { derived, get, type Readable, type Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';

import { ContextKeyExpr } from '../context/contextKey';
import { normalizeOnboardingWhenClause } from '../onboarding/onboarding-utils';
import { isDefaultScope, isPropertyValidInContext } from '../preferences/Util';

export let extension: CombinedExtensionInfoUI;

let onboardingsUnsubscribe: Unsubscriber | undefined;
let onboardingEnabledUnsubscribe: Unsubscriber | undefined;
let configurationPropertiesUnsubscribe: Unsubscriber | undefined;
let onboardingEnabledReadable: Readable<boolean>;
let isOnboardingEnabled = false;

let hasAnyConfiguration = false;

onMount(() => {
  configurationPropertiesUnsubscribe = configurationProperties.subscribe(properties => {
    let globalContext = get(context);

    hasAnyConfiguration =
      properties
        .filter(
          property =>
            property.parentId.startsWith(`preferences.${extension.id}`) &&
            isDefaultScope(property.scope) &&
            !property.hidden,
        )
        .filter(property => isPropertyValidInContext(property.when, globalContext)).length > 0;
  });

  onboardingEnabledReadable = derived([onboardingList, context], ([$onboardingList, $context]) => {
    if (extension.type === 'dd') {
      return false;
    }

    const matchingOnBoarding = $onboardingList.findLast(o => o.extension === extension.id && o.enablement);

    if (!matchingOnBoarding) {
      return false;
    } else {
      const enablement = normalizeOnboardingWhenClause(matchingOnBoarding.enablement, extension.id);
      const whenDeserialized = ContextKeyExpr.deserialize(enablement);
      const isEnabled = whenDeserialized?.evaluate($context);
      return !!isEnabled;
    }
  });

  onboardingEnabledUnsubscribe = onboardingEnabledReadable.subscribe(value => {
    isOnboardingEnabled = value;
  });
});

onDestroy(() => {
  onboardingsUnsubscribe?.();
  onboardingEnabledUnsubscribe?.();
  configurationPropertiesUnsubscribe?.();
});

function handleOnboarding() {
  router.goto(`/preferences/onboarding/${extension.id}`);
}

function handleProperties() {
  router.goto(`/preferences/default/preferences.${extension.id}`);
}
</script>

<Button
  aria-label="Onboarding {extension.name}"
  title="Onboarding {extension.name}"
  type="primary"
  class="m-auto {!isOnboardingEnabled ? 'cursor-not-allowed' : ''}"
  disabled={!isOnboardingEnabled}
  on:click={() => handleOnboarding()}>
  <Fa size="1x" icon={faGear} />
</Button>

<Button
  aria-label="Edit properties of {extension.name} extension"
  title="Edit properties of {extension.name} extension"
  type="secondary"
  class="m-auto {!hasAnyConfiguration ? 'cursor-not-allowed' : ''}"
  disabled={!hasAnyConfiguration}
  on:click={() => handleProperties()}>
  <Fa size="1x" icon={faFilePen} />
</Button>
