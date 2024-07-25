<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;
</script>

<StatusIcon icon={ConfigMapSecretIcon} status={object.status} />
