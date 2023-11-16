<script lang="ts">
import StatusIcon from '../images/StatusIcon.svelte';
import VolumeIcon from '../images/VolumeIcon.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;
</script>

<StatusIcon icon="{VolumeIcon}" status="{object.inUse ? 'USED' : 'UNUSED'}" />
