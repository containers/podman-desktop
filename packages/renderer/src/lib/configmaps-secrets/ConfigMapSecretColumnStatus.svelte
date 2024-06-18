<script lang="ts">
import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;
</script>

<StatusIcon icon="{ConfigMapSecretIcon}" status="{object.status}" />
