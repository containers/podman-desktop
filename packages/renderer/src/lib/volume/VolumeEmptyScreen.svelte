<script lang="ts">
import VolumeIcon from '../images/VolumeIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<EmptyScreen
  icon="{VolumeIcon}"
  title="No volumes"
  message="Create a volume using the following command line:"
  commandline="podman volume create myFirstVolume" />
