<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import IconImage from '../appearance/IconImage.svelte';

export let extension: { icon?: string | { light: string; dark: string }; name: string; state: string };

$: fade = extension.state !== 'started' ? ' brightness-50' : '';
</script>

{#if extension.icon}
  <IconImage image={extension.icon} alt={extension.name} class="max-w-8 max-h-8 {fade}" />
{:else}
  <Fa class="h-8 w-8 rounded-full text-violet-600 {fade}" size="1.6x" icon={faPuzzlePiece} />
{/if}
