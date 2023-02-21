<script lang="ts">
import type { ContainerInfoUI } from './ContainerInfoUI';
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';

export let containers: ContainerInfoUI[] = [];

let isRunning = false;
$: isRunning = containers.every(c => c.state === 'RUNNING') ? true : false;
</script>

<StatusIcon icon="{PodIcon}" status="{isRunning ? 'RUNNING' : 'STOPPED'}" />
