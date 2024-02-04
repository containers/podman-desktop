<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import StatusIcon from '../images/StatusIcon.svelte';

export let object: ImageInfoUI;
</script>

<StatusIcon icon="{object.icon}" status="{object.status}" />
