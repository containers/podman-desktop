<script lang="ts">
import PVCIcon from '../images/PVCIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { PVCUI } from './PVCUI';

export let object: PVCUI;
</script>

<StatusIcon icon="{PVCIcon}" status="{object.status}" />
