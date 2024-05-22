<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import PodIcon from '../images/PodIcon.svelte';
</script>

<EmptyScreen
  icon="{PodIcon}"
  title="No pods"
  message="Run a first pod using the following command line:"
  commandline="podman pod create --label myFirstPod" />
