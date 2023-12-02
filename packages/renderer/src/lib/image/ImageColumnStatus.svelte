<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import ImageIcon from '../images/ImageIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';

export let object: ImageInfoUI;
</script>

<StatusIcon icon="{ImageIcon}" status="{object.inUse ? 'USED' : 'UNUSED'}" />
