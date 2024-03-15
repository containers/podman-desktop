<script lang="ts">
import ImageIcon from '../images/ImageIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<EmptyScreen
  icon="{ImageIcon}"
  title="No images"
  message="Pull a first image using the following command line:"
  commandline="podman pull quay.io/podman/hello" />
