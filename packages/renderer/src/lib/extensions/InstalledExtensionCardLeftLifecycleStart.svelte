<script lang="ts">
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import LoadingIconButton from '../ui/LoadingIconButton.svelte';

export let extension: CombinedExtensionInfoUI;

let inProgress = false;

async function startExtension(): Promise<void> {
  inProgress = true;
  await window.startExtension(extension.id);
  inProgress = false;
}
</script>

{#if extension.state === 'stopped' || extension.state === 'failed'}
  <LoadingIconButton
    clickAction={() => startExtension()}
    action="start"
    icon={faPlay}
    state={{ status: extension.state, inProgress }}
    leftPosition="" />
{/if}
