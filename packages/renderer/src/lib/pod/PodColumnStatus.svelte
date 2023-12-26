<script lang="ts">
import type { PodInfoUI } from './PodInfoUI';
import StatusIcon from '../images/StatusIcon.svelte';
import PodIcon from '../images/PodIcon.svelte';

export let object: PodInfoUI;
</script>

<StatusIcon icon="{PodIcon}" status="{object.status}" />
