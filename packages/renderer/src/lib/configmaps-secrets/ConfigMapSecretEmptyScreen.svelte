<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
</script>

<EmptyScreen
  icon="{ConfigMapSecretIcon}"
  title="No configmaps or secrets"
  message="Try switching to a different context or namespace" />
