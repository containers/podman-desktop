<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

export let extension: { icon?: string | { light: string; dark: string }; name: string; state: string };

let icon: string | undefined = undefined;
$: {
  if (extension.icon) {
    if (typeof extension.icon === 'string') {
      icon = extension.icon;
    } else if (extension.icon.dark) {
      // for now use dark theme
      icon = extension.icon.dark;
    }
  }
}
$: fade = extension.state !== 'started' ? ' brightness-50' : '';
</script>

{#if icon}
  <img src={icon} alt={extension.name} class="max-w-8 max-h-8 {fade}" />
{:else}
  <Fa class="h-8 w-8 rounded-full text-violet-600 {fade}" size="1.6x" icon={faPuzzlePiece} />
{/if}
