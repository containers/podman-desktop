<script lang="ts">
import StatusIcon from '../images/StatusIcon.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let object: ImageInfoUI;
</script>

<StatusIcon icon="{object.icon}" status="{object.status}" />
