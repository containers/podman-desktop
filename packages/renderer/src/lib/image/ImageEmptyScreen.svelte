<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import ImageIcon from '../images/ImageIcon.svelte';
</script>

<EmptyScreen
  icon="{ImageIcon}"
  title="No images"
  message="Pull a first image using the following command line:"
  commandline="podman pull redhat/ubi8-micro" />
