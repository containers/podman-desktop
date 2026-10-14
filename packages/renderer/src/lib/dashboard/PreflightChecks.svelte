<script lang="ts">
import type { CheckStatus } from '@desktop-framework/api';
import { faCheck, faCircleExclamation, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Link, Spinner } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

interface Props {
  preflightChecks: CheckStatus[];
}

let { preflightChecks }: Props = $props();

async function openLink(url: string): Promise<void> {
  await window.openExternal(url);
}
</script>

{#if preflightChecks.length > 0}
  <div class="flex flex-col w-full p-2 rounded-lg bg-[var(--pd-invert-content-card-bg)]">
    {#each preflightChecks as preCheck, index (index)}
      <div class="flex flex-col">
        <div class="mb-4 flex flex-row items-center">
          {#if preCheck.successful === undefined}
            <div class="mr-1">
              <Spinner size="1em" />
            </div>
          {:else if preCheck.successful}
            <Icon class="text-(--pd-state-success)" icon={faCheck} />
          {:else if preCheck.severity === 'warning'}
            <Icon class="text-(--pd-state-warning)" icon={faTriangleExclamation} />
          {:else}
            <Icon class="text-(--pd-state-error)" icon={faCircleExclamation} />
          {/if}
          <div aria-label="precheck-title" class="ml-2">{preCheck.name}</div>
        </div>
        {#if preCheck.description}
          Details: <p
            aria-label="precheck-description"
            class="text-[var(--pd-invert-content-card-text)] w-full break-all">
            {preCheck.description}
          </p>
          {#if preCheck.docLinksDescription}
            <p aria-label="precheck-docLinksDescription" class="text-[var(--pd-invert-content-card-text)] w-full">
              {preCheck.docLinksDescription}
            </p>
          {/if}
          {#if preCheck.docLinks}
            See:
            {#each preCheck.docLinks as link, index (index)}
              <Link aria-label="precheck-link" on:click={async (): Promise<void> => await openLink(link.url)}>{link.title}</Link>
            {/each}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
