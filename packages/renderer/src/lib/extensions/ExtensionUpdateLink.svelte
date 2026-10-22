<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';
import type { ComponentProps } from 'svelte';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

interface Props extends ComponentProps<typeof Button> {
  extension: CombinedExtensionInfoUI;
}

let { extension, ...restProps }: Props = $props();

let inProgress = $state(false);

async function updateExtension(ociUri: string): Promise<void> {
  inProgress = true;
  try {
    await window.updateExtension(extension.id, ociUri);
  } catch (err: unknown) {
    console.error(`Unable to update extension ${extension.id}`, err);
  } finally {
    inProgress = false;
  }
}
</script>

{#if extension.update}
  {@const update = extension.update}
  <Button
    type="link"
    class="underline"
    padding="p-0"
    {inProgress}
    title="{extension.displayName} will be updated to v{update.version}"
    aria-label="Update available"
    onclick={(): Promise<void> => updateExtension(update.ociUri)}
    {...restProps}
  >Update available</Button>
{/if}
