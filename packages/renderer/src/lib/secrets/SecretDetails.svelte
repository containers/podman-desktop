<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import SecretIcon from '/@/lib/images/SecretIcon.svelte';
import SecretActions from '/@/lib/secrets/components/SecretActions.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import { handleNavigation } from '/@/navigation';
import Route from '/@/Route.svelte';
import { secretsInfo } from '/@/stores/secrets';

import SecretDetailsInspect from './tabs/SecretDetailsInspect.svelte';
import SecretDetailsSummary from './tabs/SecretDetailsSummary.svelte';

interface Props {
  secretId: string;
  engineId: string;
}

let { secretId, engineId }: Props = $props();

let secret = $derived($secretsInfo.find(item => item.Id === secretId && item.engineId === engineId));

$effect(() => {
  if (!secret) {
    handleNavigation({ page: NavigationPage.SECRETS });
  }
});
</script>

{#if secret}
  <DetailsPage title={secret.Name} subtitle={secret.Id}>
    {#snippet iconSnippet()}
      <StatusIcon icon={SecretIcon} size={24} />
    {/snippet}

    {#snippet actionsSnippet()}
      <SecretActions object={secret} detailed={true} />
    {/snippet}

    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
    {/snippet}

    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <SecretDetailsSummary {secret} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <SecretDetailsInspect {secret} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
